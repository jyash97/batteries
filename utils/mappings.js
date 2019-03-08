import mappingUsecase from './mappingUsecase';
import analyzerSettings from './analyzerSettings';
import { getURL } from '../../constants/config';

const PRESERVED_KEYS = ['meta'];
export const REMOVED_KEYS = ['~logs', '~percolator', '.logs', '.percolator', '_default_'];

export function getAuthHeaders(credentials) {
	if (credentials) {
		return {
			Authorization: `Basic ${btoa(credentials)}`,
		};
	}
	return {};
}

export function getMappings(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_mapping`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((data) => {
				const types = Object.keys(data[appName].mappings).filter(
					type => !REMOVED_KEYS.includes(type),
				);

				let mappings = {};
				types.forEach((type) => {
					mappings = {
						...mappings,
						[type]: data[appName].mappings[type],
					};
				});
				resolve(mappings);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function putMapping(appName, credentials, mappings, type, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_mapping/${type}`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...mappings,
			}),
		})
			.then(res => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function getSettings(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function closeIndex(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_close`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function updateSynonyms(appName, credentials, synonymsArray, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				analysis: {
					filter: {
						synonyms_filter: {
							type: 'synonym',
							synonyms: synonymsArray,
						},
					},
					analyzer: {
						english_synonyms_analyzer: {
							filter: ['lowercase', 'synonyms_filter', 'asciifolding', 'porter_stem'],
							tokenizer: 'standard',
							type: 'custom',
						},
						english_analyzer: {
							filter: ['lowercase', 'asciifolding', 'porter_stem'],
							tokenizer: 'standard',
							type: 'custom',
						},
					},
				},
			}),
		})
			.then(res => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function openIndex(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_open`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export async function getESVersion(appName, credentials) {
	const ACC_API = getURL();
	const response = await fetch(ACC_API, {
		headers: {
			...getAuthHeaders(credentials),
		},
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	return data.version.number;
}

export function reIndex(
	mappings,
	appId,
	excludeFields,
	type,
	version = '5',
	credentials,
	settings,
) {
	const body = {
		mappings,
		settings: { analysis: settings || analyzerSettings },
		exclude_fields: excludeFields,
		type,
		es_version: version,
	};
	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_reindex/${appId}`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => {
				if (res.status === 504) {
					resolve('~100');
				}
				return res;
			})
			.then(res => res.json())
			.then((data) => {
				if (data.error) {
					reject(data.error);
				}
				if (data.code >= 400) {
					reject(data.message);
				}
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function hasAggs(field) {
	if (!field) return false;

	let hasAggsFlag = false;
	Object.keys(field).forEach((subField) => {
		if (
			field[subField].type === 'keyword'
			|| (field[subField].type === 'string' && field[subField].index === 'not_analyzed') // for ES2
		) {
			hasAggsFlag = true;
		}
	});
	return hasAggsFlag;
}

export function getTypesFromMapping(mapping) {
	return Object.keys(mapping);
}

export function transformToES5(mapping) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	Object.keys(_mapping).every((key) => {
		if (PRESERVED_KEYS.includes(key)) return false;

		if (_mapping[key].type === 'string') {
			const hasUsecase = !!_mapping[key].fields;
			let usecase = { ..._mapping[key] };

			if (hasUsecase) {
				if (_mapping[key].fields.search) {
					usecase = mappingUsecase.search;
				} else if (hasAggs(_mapping[key].field)) {
					usecase = mappingUsecase.aggs;
				}
			}

			_mapping = {
				..._mapping,
				[key]: {
					...usecase,
					type: 'text',
				},
			};
		} else if (typeof _mapping[key] === 'object' && !Array.isArray(_mapping[key])) {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					...transformToES5(_mapping[key]),
				},
			};
		}
		return true;
	});
	return _mapping;
}

export function updateMapping(mapping, field, type, usecase) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	Object.keys(_mapping).every((key) => {
		if (PRESERVED_KEYS.includes(key)) return false;

		if (key === field) {
			let newUsecase = {};
			if (usecase) {
				newUsecase = mappingUsecase[usecase];
			}
			_mapping = {
				..._mapping,
				[key]: {
					...newUsecase,
					type,
				},
			};
		} else if (typeof _mapping[key] === 'object' && !Array.isArray(_mapping[key])) {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					...updateMapping(_mapping[key], field, type, usecase),
				},
			};
		}
		return true;
	});
	return _mapping;
}

/**
 * Traverse the mappings object & returns the fields (leaf)
 * @param {Object} mappings
 * @returns {{ [key: string]: Array<string> }}
 */
export function traverseMapping(mappings = {}, returnOnlyLeafFields = false) {
	const fieldObject = {};
	const checkIfPropertyPresent = (m, type) => {
		fieldObject[type] = [];
		const setFields = (mp, prefix = '') => {
			if (mp.properties) {
				Object.keys(mp.properties).forEach((mpp) => {
					if (!returnOnlyLeafFields) {
						fieldObject[type].push(`${prefix}${mpp}`);
					}
					const field = mp.properties[mpp];
					if (field && field.properties) {
						setFields(field, `${prefix}${mpp}.`);
					} else if (returnOnlyLeafFields) {
						// To return only leaf fields
						fieldObject[type].push(`${prefix}${mpp}`);
					}
				});
			}
		};
		setFields(m);
	};
	Object.keys(mappings).forEach(k => checkIfPropertyPresent(mappings[k], k));
	return fieldObject;
}

function getFieldsTree(mappings = {}, prefix = null) {
	let tree = {};
	Object.keys(mappings).forEach((key) => {
		if (mappings[key].properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings[key].properties, key),
			};
		} else {
			const originalFields = mappings[key].fields;
			tree = {
				...tree,
				[`${prefix ? `${prefix}.` : ''}${key}`]: {
					type: mappings[key].type,
					fields: mappings[key].fields ? Object.keys(mappings[key].fields) : [],
					originalFields: originalFields || {},
				},
			};
		}
	});

	return tree;
}

/**
 * returns field types with sub-fields
 * @param {Object} mappings
 * @param {String} prefix
 */
export function getMappingsTree(mappings = {}) {
	let tree = {};
	Object.keys(mappings).forEach((key) => {
		if (mappings[key].properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings[key].properties, null),
			};
		}
	});

	return tree;
}
