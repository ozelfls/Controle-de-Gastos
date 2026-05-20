use rusqlite::{params, Connection, OptionalExtension};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistedFinanceState {
    active_strategy_pack_ids: Vec<String>,
    selected_month: String,
    strategy_aggressiveness: String,
    transactions: Vec<Transaction>,
    goals: Vec<Goal>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Transaction {
    id: String,
    #[serde(rename = "type")]
    kind: String,
    category: String,
    description: String,
    amount: f64,
    date: String,
    recurring: bool,
    status: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Goal {
    id: String,
    name: String,
    target_amount: f64,
    current_amount: f64,
    priority: String,
}

#[tauri::command]
fn finance_load_state(app: AppHandle) -> Result<Option<PersistedFinanceState>, String> {
    let connection = open_connection(&app)?;
    ensure_schema(&connection)?;

    let initialized = load_meta_string(&connection, "state_initialized")?;

    if initialized.as_deref() != Some("true") {
        return Ok(None);
    }

    let active_strategy_pack_ids = load_meta_json::<Vec<String>>(
        &connection,
        "active_strategy_pack_ids",
    )?
    .unwrap_or_default();
    let selected_month = load_meta_string(&connection, "selected_month")?
        .unwrap_or_else(|| "1970-01".to_string());
    let strategy_aggressiveness = load_meta_string(&connection, "strategy_aggressiveness")?
        .unwrap_or_else(|| "low".to_string());

    Ok(Some(PersistedFinanceState {
        active_strategy_pack_ids,
        selected_month,
        strategy_aggressiveness,
        transactions: load_transactions(&connection)?,
        goals: load_goals(&connection)?,
    }))
}

#[tauri::command]
fn finance_save_state(app: AppHandle, state: PersistedFinanceState) -> Result<(), String> {
    let mut connection = open_connection(&app)?;
    ensure_schema(&connection)?;

    let transaction = connection.transaction().map_err(format_sql_error)?;
    transaction
        .execute("DELETE FROM transactions", [])
        .map_err(format_sql_error)?;
    transaction
        .execute("DELETE FROM goals", [])
        .map_err(format_sql_error)?;

    for item in state.transactions {
        transaction
            .execute(
                "INSERT INTO transactions (
                    id, type, category, description, amount, date, recurring, status
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    item.id,
                    item.kind,
                    item.category,
                    item.description,
                    item.amount,
                    item.date,
                    if item.recurring { 1 } else { 0 },
                    item.status,
                ],
            )
            .map_err(format_sql_error)?;
    }

    for goal in state.goals {
        transaction
            .execute(
                "INSERT INTO goals (
                    id, name, target_amount, current_amount, priority
                ) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![
                    goal.id,
                    goal.name,
                    goal.target_amount,
                    goal.current_amount,
                    goal.priority,
                ],
            )
            .map_err(format_sql_error)?;
    }

    save_meta_string(&transaction, "state_initialized", "true")?;
    save_meta_string(
        &transaction,
        "active_strategy_pack_ids",
        &serde_json::to_string(&state.active_strategy_pack_ids).map_err(|error| error.to_string())?,
    )?;
    save_meta_string(&transaction, "selected_month", &state.selected_month)?;
    save_meta_string(
        &transaction,
        "strategy_aggressiveness",
        &state.strategy_aggressiveness,
    )?;

    transaction.commit().map_err(format_sql_error)
}

#[tauri::command]
fn finance_clear_state(app: AppHandle) -> Result<(), String> {
    let connection = open_connection(&app)?;
    ensure_schema(&connection)?;

    connection
        .execute("DELETE FROM transactions", [])
        .map_err(format_sql_error)?;
    connection
        .execute("DELETE FROM goals", [])
        .map_err(format_sql_error)?;
    connection
        .execute("DELETE FROM app_meta", [])
        .map_err(format_sql_error)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            finance_load_state,
            finance_save_state,
            finance_clear_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn open_connection(app: &AppHandle) -> Result<Connection, String> {
    let path = database_path(app)?;
    Connection::open(path).map_err(format_sql_error)
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&data_dir).map_err(|error| error.to_string())?;
    Ok(data_dir.join("finance.sqlite3"))
}

fn ensure_schema(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL CHECK (amount >= 0),
                date TEXT NOT NULL,
                recurring INTEGER NOT NULL DEFAULT 0,
                status TEXT
            );

            CREATE TABLE IF NOT EXISTS goals (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                target_amount REAL NOT NULL CHECK (target_amount >= 0),
                current_amount REAL NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
                priority TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            ",
        )
        .map_err(format_sql_error)
}

fn load_transactions(connection: &Connection) -> Result<Vec<Transaction>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, type, category, description, amount, date, recurring, status
             FROM transactions
             ORDER BY date DESC, id ASC",
        )
        .map_err(format_sql_error)?;

    let rows = statement
        .query_map([], |row| {
            Ok(Transaction {
                id: row.get(0)?,
                kind: row.get(1)?,
                category: row.get(2)?,
                description: row.get(3)?,
                amount: row.get(4)?,
                date: row.get(5)?,
                recurring: row.get::<_, i64>(6)? == 1,
                status: row.get(7)?,
            })
        })
        .map_err(format_sql_error)?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(format_sql_error)
}

fn load_goals(connection: &Connection) -> Result<Vec<Goal>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, name, target_amount, current_amount, priority
             FROM goals
             ORDER BY priority DESC, name ASC",
        )
        .map_err(format_sql_error)?;

    let rows = statement
        .query_map([], |row| {
            Ok(Goal {
                id: row.get(0)?,
                name: row.get(1)?,
                target_amount: row.get(2)?,
                current_amount: row.get(3)?,
                priority: row.get(4)?,
            })
        })
        .map_err(format_sql_error)?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(format_sql_error)
}

fn load_meta_string(connection: &Connection, key: &str) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT value FROM app_meta WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .optional()
        .map_err(format_sql_error)
}

fn load_meta_json<T>(connection: &Connection, key: &str) -> Result<Option<T>, String>
where
    T: serde::de::DeserializeOwned,
{
    load_meta_string(connection, key)?
        .map(|value| serde_json::from_str(&value).map_err(|error| error.to_string()))
        .transpose()
}

fn save_meta_string(
    transaction: &rusqlite::Transaction<'_>,
    key: &str,
    value: &str,
) -> Result<(), String> {
    transaction
        .execute(
            "INSERT INTO app_meta (key, value)
             VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map(|_| ())
        .map_err(format_sql_error)
}

fn format_sql_error(error: rusqlite::Error) -> String {
    error.to_string()
}
