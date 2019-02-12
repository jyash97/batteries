export default {
	aggs: {
		fields: {
			keyword: {
				type: 'keyword',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	search: {
		fields: {
			search: {
				type: 'text',
				index: 'true',
				analyzer: 'ngram_analyzer',
				search_analyzer: 'simple',
			},
			autosuggest: {
				type: 'text',
				index: 'true',
				analyzer: 'autosuggest_analyzer',
				search_analyzer: 'simple',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	searchaggs: {
		fields: {
			keyword: {
				type: 'keyword',
				index: 'true',
			},
			search: {
				type: 'text',
				index: 'true',
				analyzer: 'ngram_analyzer',
				search_analyzer: 'simple',
			},
			autosuggest: {
				type: 'text',
				index: 'true',
				analyzer: 'autosuggest_analyzer',
				search_analyzer: 'simple',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	none: {},
};
