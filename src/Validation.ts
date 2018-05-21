
const NAME_REG_EXP: RegExp = /^[/w .]+$/.compile()
const EMAIL_REG_EXP: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.compile()
const PASSWORD_REG_EXP: RegExp = /^[!@#$%^&*()-_=+\w]+$/.compile()

class Validation {

	public static errorForText(text: string, label: string, length: number) {
		if (typeof text !== 'string' || text.length === 0) {
			return `Invalid ${label}`
		}
		else if (text.length > length) {
			return `${label.charAt(0).toUpperCase()}${label.substring(1)} must be at most ${length} characters long`
		}
		else if (!NAME_REG_EXP.test(text)) {
			return `${label.charAt(0).toUpperCase()}${label.substring(1)} must only contain alphanumeric characters, symbols, and spaces`
		}

		return ''
	}

	public static errorForName(name: string): string {
		if (typeof name !== 'string' || name.length === 0) {
			return 'Invalid name'
		}
		else if (name.length > 100) {
			return 'Name must be at most 100 characters long'
		}
		else if (!NAME_REG_EXP.test(name)) {
			return 'Name must only contain alphanumeric characters, symbols, and spaces'
		}

		return ''
	}

	public static errorForEmail(email: string): string {
		if (!(typeof email === 'string' && email.length <= 256 && EMAIL_REG_EXP.test(email))) {
			return 'Invalid email'
		}

		return ''
	}

	public static errorForPassword(password: string): string {
		if (typeof password !== 'string') {
			return 'Invalid password'
		}
		else if (password.length < 8) {
			return 'Password must be at least 8 characters long'
		}
		else if (password.length > 50) {
			return 'Password must be at most 50 characters long'
		}
		else if (!PASSWORD_REG_EXP.test(password)) {
			return 'Password must only contain alphanumeric characters and !@#$%^&*()-_=+'
		}

		return ''
	}

	public static errorForConfirmPassword(password: string, confirmPassword: string): string {
		if (!(typeof confirmPassword === 'string' && password === confirmPassword)) {
			return 'Passwords must match'
		}

		return ''
	}

}

export default Validation
