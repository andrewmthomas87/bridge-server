import * as mysql from 'mysql'

class Connection {

	private _connection: mysql.Connection

	public constructor(host: string, user: string, password: string, database: string) {
		this._connection = mysql.createConnection({ host, user, password, database })
	}

	public connect() {
		this._connection.connect()
	}

	public query<Row>(query: string, values: any[] = []): Promise<Row[]> {
		return new Promise<Row[]>((resolve, reject) => {
			this._connection.query(query, values, (error, rows) => {
				if (error) {
					reject(error)
				}
				else {
					resolve(rows as Row[])
				}
			})
		})
	}

	public querySingleRow<Row>(query: string, values: any[] = []): Promise<Row> {
		return this.query<Row>(query, values)
			.then((rows: Row[]): Row => {
				if (!rows.length) {
					throw 'No rows'
				}

				return rows[0]
			})
	}

	public queryNoReturn(query: string, values: any[] = []): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this._connection.query(query, values, (error, value) => {
				if (error) {
					reject(error)
				}
				else {
					resolve(value ? value.insertId : -1)
				}
			})
		})
	}

}

interface IUserRow {
	id: number
	isGroup: boolean
	name: string
	email: string
	password: string
}

interface IEventRow {
	id: number
	groupId: number
	title: string
	location: string
	eventDate: Date
	description: string
}

const connection: Connection = new Connection('localhost', 'root', 'xyzzyy', 'bridge')

export {
	IUserRow, IEventRow,
	connection as default
}
