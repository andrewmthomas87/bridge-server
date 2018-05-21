import { Express, Request, Response } from 'express'

import connection, { IUserRow } from './connection'
import { getToken, isValid, IToken } from './server'
import Validation from './Validation'

type Handler<T, U> = (token: IToken, data: T, request?: Request, response?: Response) => Promise<U>

interface IUserData {
	id: number
	isGroup: boolean
	name: string
	email: string
}

interface ICreateEventRequest {
	title: string,
	location: string
	month: number
	year: number
	day: number
	description: string
}

interface ICreateEventError {
	titleError: string
	locationError: string
	dateError: string
	descriptionError: string
}

class API {

	private _app: Express

	public constructor(app: Express) {
		this._app = app
	}

	public registerHandlers() {
		this._registerHandler<void, IUserData>('/get-user', this._getUser)
		this._registerHandler<ICreateEventRequest, void>('/create-event', this._createEvent, ['title', 'location', 'month', 'year', 'day', 'description'])
	}

	private _getUser = (token: IToken): Promise<IUserData> => {
		return connection.querySingleRow<IUserRow>('select name, email from users where id=?', [token.id]).then((row: IUserRow) => {
			return {
				id: token.id,
				isGroup: token.isGroup,
				name: row.name,
				email: row.email
			}
		}).catch(() => {
			throw 500
		})
	}

	private _createEvent = (token: IToken, data: ICreateEventRequest): Promise<void> => {
		if (!token.isGroup) {
			return Promise.reject(403)
		}

		const errors: Map<string, string> = new Map()
		let error: string = Validation.errorForText(data.title, 'title', 100)
		if (error) errors.set('title', error)
		error = Validation.errorForText(data.location, 'location', 100)
		if (error) errors.set('location', error)
		error = Validation.errorForText(data.location, 'location', 100)
		if (error) errors.set('location', error)
		error = Validation.errorForText(data.description, 'description', 1000)
		if (error) errors.set('description', error)

		if (errors.size) {
			throw {
				titleError: errors.get('title') || '',
				locationError: errors.get('location') || '',
				dateError: errors.get('date') || '',
				descriptionError: errors.get('description') || ''
			} as ICreateEventError
		}

		return connection.queryNoReturn('insert into events (groupId, title, location, eventDate, description) values(?, ?, ?, date_add(date_add(makedate(?, 1), interval (?) month), interval (?)-1 day), ?)', [token.id, data.title, data.location, data.year, data.month, data.day, data.description])
			.then(() => { })
			.catch(() => {
				throw 500
			})
	}

	private _registerHandler<T, U>(route: string, handler: Handler<T, U>, keys?: string[]) {
		this._app.post(`/api${route}`, this._handleRequest.bind(this, handler, keys))
	}

	private _handleRequest(handler: Handler<any, any>, keys: string[] | undefined, request: Request, response: Response) {
		const token: IToken | null = getToken(request)
		if (token === null) {
			response.sendStatus(403)
			return
		}

		let data: any
		if (keys) {
			data = request.body
			if (!isValid(data, ...keys)) {
				response.sendStatus(400)
				return
			}
		}
		else {
			data = undefined
		}

		handler(token, data, request, response).then((data: any) => {
			response.send({
				ok: true,
				data
			})
		}).catch((error: any) => {
			if (typeof error === 'number') {
				response.sendStatus(error)
			}
			else {
				response.send({
					ok: false,
					error
				})
			}
		})
	}

}

export default API
