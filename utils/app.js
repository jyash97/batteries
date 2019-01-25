import {
 doDelete, doPatch, doGet, doPost,
} from './requestService';
import { getURL } from '../../constants/config';

export const transferOwnership = (appId, info) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/app/${appId}/changeowner`, info);
};

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export const getPermission = () => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();

		fetch(`${ACC_API}/_permissions`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const updatePermission = (appId, username, info) => {
	const ACC_API = getURL();
	return doPatch(`${ACC_API}/app/${appId}/permission/${username}`, info);
};

export const newPermission = (appId, info) => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_permission`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify(info),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deletePermission = (appId, username) => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_permission/${username}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deleteApp = (appId) => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/${appId}`);
};

export const getShare = (appId) => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/app/${appId}/share`);
};

export const createShare = (appId, payload) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/app/${appId}/share`, payload);
};

export const getAppPlan = (appName) => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/app/${appName}/plan`);
};

export const createSubscription = (token, plan, appName) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/app/${appName}/subscription`, { token, plan });
};

export const deleteSubscription = (appName) => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/app/${appName}/subscription`);
};
