import axios from 'axios';
const API_URL = 'http://localhost:8000';

export default class CustomersService {

	constructor() { }

	getCustomers() {
		console.log("get user");
		const url = `${API_URL}/api/`;
		return axios.get(url).then(response => response.data);
	}

	getCustomersByURL(link) {
		const url = `${API_URL}/api/login/`;
		return axios.post(url).then(response => response.data);
	}
}