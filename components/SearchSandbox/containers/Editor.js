import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Button,
	Modal,
	Form,
	Tree,
	Popover,
	Tooltip,
	notification,
	Popconfirm,
	message,
} from 'antd';
import { ReactiveBase, SelectedFilters } from '@appbaseio/reactivesearch';
import ExpandCollapse from 'react-expand-collapse';
import PropTypes from 'prop-types';

import Appbase from 'appbase-js';

import Ace from './AceEditor';
import multiListTypes from '../utils/multilist-types';
import RSWrapper from '../components/RSWrapper';
import { listItem, formWrapper } from '../styles';
import DataFieldInput from '../components/DataFieldInput';
import { getAvailableDataField } from '../utils/dataField';
import {
 NumberInput, TextInput, DropdownInput, ToggleInput,
} from '../../shared/Input';

const { TreeNode } = Tree;

export default class Editor extends Component {
	constructor(props) {
		super(props);

		const { mappings } = props;
		const dataFields = getAvailableDataField({
			id: 'MultiList',
			component: 'MultiList',
			mappings,
		});
		this.state = {
			showModal: false,
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
			editorValue: '',
			isValidJSON: true,
			editorObjectId: '',
			renderKey: Date.now(),
			showVideo: false,
			isEditable: false,
		};
		const { appName, url, credentials } = props;
		this.appbaseRef = Appbase({
			app: appName,
			url,
			credentials,
		});
	}

	copyJSON = (code) => {
		const el = document.createElement('textarea');
		el.value = JSON.stringify(code);
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
		this.setState(
			{
				copied: true,
			},
			() => setTimeout(
					() => this.setState({
							copied: false,
						}),
					300,
				),
		);
	};

	showModal = () => {
		this.setState({
			showModal: true,
		});
	};

	resetNewComponentData = () => {
		const { mappings } = this.props;
		const dataFields = getAvailableDataField({
			id: 'MultiList',
			component: 'MultiList',
			mappings,
		});
		this.setState({
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
		});
	};

	handleOk = () => {
		// only set to store if dataField is valid
		const { mappings } = this.props;
		const fields = getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings });
		if (fields.length) {
			const { filterCount, setFilterCount, onPropChange } = this.props;
			const { listComponentProps } = this.state;
			onPropChange(`list-${filterCount + 1}`, listComponentProps);
			setFilterCount(filterCount + 1);
			this.setState(
				{
					showModal: false,
				},
				this.resetNewComponentData,
			);
			message.success('New filter added');
		} else {
			this.setState({
				showModal: false,
			});
		}
	};

	handleCancel = () => {
		this.setState(
			{
				showModal: false,
			},
			this.resetNewComponentData,
		);
	};

	handleVideoModal = () => {
		this.setState(({ showVideo }) => ({
			showVideo: !showVideo,
		}));
	};

	setComponentProps = (newProps) => {
		const { listComponentProps } = this.state;
		this.setState({
			listComponentProps: {
				...listComponentProps,
				...newProps,
			},
		});
	};

	handleUpdateJSON = (updatedJSONString) => {
		const updatedJSON = JSON.parse(updatedJSONString);
		const { mappingsType } = this.props;
		const { editorObjectId } = this.state;
		let responseMessage = {
			message: 'Edit successfully saved',
			description: 'The desired result data was successfully updated.',
			duration: 4,
		};
		this.appbaseRef
			.update({
				type: mappingsType,
				id: editorObjectId,
				body: {
					doc: updatedJSON,
				},
			})
			.then((res) => {
				this.setState({
					isEditable: false,
					renderKey: res._timestamp, // eslint-disable-line
				});
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Update JSON',
					description: 'There were error in Updating JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	handleDeleteJSON = (id) => {
		let responseMessage = {
			message: 'Delete JSON',
			description: 'You have successfully deleted JSON.',
			duration: 4,
		};
		const { mappingsType } = this.props;
		this.appbaseRef
			.delete({
				type: mappingsType,
				id,
			})
			.then((res) => {
				this.setState({
					renderKey: res._timestamp,
				});
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Delete JSON',
					description: 'There were error in Deleting JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	handleEditing = () => {
		this.setState(({ isEditable }) => ({
			isEditable: !isEditable,
		}));
	};

	handleEditingJSON = (value) => {
		let isValidJSON = true;
		try {
			JSON.parse(value);
		} catch (e) {
			isValidJSON = false;
		}
		this.setState({
			editorValue: value,
			isValidJSON,
		});
	};

	handleInitialEditorValue = (res) => {
		const { _id: id, _index: del, ...objectJSON } = res;

		const stringifiedJSON = JSON.stringify(objectJSON, null, '\t');

		this.setState({
			editorObjectId: id,
			editorValue: stringifiedJSON,
		});
	};

	resetEditorValues = () => {
		this.setState({
			editorObjectId: '',
			editorValue: '',
			isEditable: false,
		});
	};

	renderFormItem = (item, name) => {
		let FormInput = null;
		// always set to default value
		const value = item.default;

		switch (item.input) {
			case 'bool': {
				FormInput = (
					<ToggleInput name={name} value={value} handleChange={this.setComponentProps} />
				);
				break;
			}
			case 'number': {
				FormInput = (
					<NumberInput
						name={name}
						value={Number(value)}
						min={1}
						handleChange={this.setComponentProps}
					/>
				);
				break;
			}
			case 'dropdown': {
				FormInput = (
					<DropdownInput
						options={multiListTypes[name].options}
						value={value}
						name={name}
						handleChange={this.setComponentProps}
					/>
				);
				break;
			}
			default: {
				FormInput = (
					<TextInput name={name} value={value} handleChange={this.setComponentProps} />
				);
				break;
			}
		}

		return (
			<Form.Item label={item.label} colon={false} key={name}>
				<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
					{item.description}
				</div>
				{FormInput}
			</Form.Item>
		);
	};

	renderPropsForm = () => {
		const { mappingsURL, mappings } = this.props;
		const fields = getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings });
		const fieldsOptions = [];
		fields.map(field => fieldsOptions.push({
				key: field,
				label: field,
			}));
		if (!fields.length) {
			return (
				<p>
					There are no compatible fields present in your data mappings.{' '}
					<a href={mappingsURL}>You can edit your mappings</a> to add filters
					(agggregation components).
				</p>
			);
		}

		const { listComponentProps } = this.state;
		return (
			<Form onSubmit={this.handleSubmit} className={formWrapper}>
				<DataFieldInput
					label={multiListTypes.dataField.label}
					description={multiListTypes.dataField.description}
					setComponentProps={this.setComponentProps}
					componentProps={listComponentProps}
					getAvailableDataField={() => getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings })
					}
				/>
				{Object.keys(multiListTypes)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(multiListTypes[item], item))}
			</Form>
		);
	};

	renderAsTree = (res, key = '0') => {
		if (!res) return null;
		const iterable = Array.isArray(res) ? res : Object.keys(res);
		return iterable.map((item, index) => {
			const type = typeof res[item];
			if (type === 'string' || type === 'number') {
				const title = (
					<div>
						<span>{item}:</span>
						&nbsp;
						<span dangerouslySetInnerHTML={{ __html: res[item] }} />
					</div>
				);
				return <TreeNode title={title} key={`${key}-${index + 1}`} />;
			}
			const hasObject = res[item] === undefined && typeof item !== 'string';
			const node = hasObject ? item : res[item];
			return (
				<TreeNode
					title={
						typeof item !== 'string'
							? 'Object'
							: `${node || Array.isArray(res) ? item : `${item}: null`}`
					}
					key={`${key}-${index + 1}`}
				>
					{this.renderAsTree(node, `${key}-${index + 1}`)}
				</TreeNode>
			);
		});
	};

	renderDeleteJSON = res => (
		<Popconfirm
			title="Are you sure you want to delete this JSON?"
			placement="bottomRight"
			onConfirm={() => this.handleDeleteJSON(res._id)}
			okText="Yes"
		>
			<Button shape="circle" icon="delete" style={{ marginRight: '5px' }} />
		</Popconfirm>
	);

	renderJSONEditor = (res) => {
		const {
 isEditable, copied, isValidJSON, editorValue,
} = this.state;
		return (
			<Popover
				placement="leftTop"
				trigger="click"
				onVisibleChange={visible => (visible ? this.handleInitialEditorValue(res) : this.resetEditorValues())
				}
				content={
					isEditable ? (
						<Ace
							mode="json"
							value={editorValue}
							onChange={value => this.handleEditingJSON(value)}
							theme="monokai"
							name="editor-JSON"
							fontSize={14}
							showPrintMargin
							style={{ maxHeight: '250px' }}
							showGutter
							highlightActiveLine
							setOptions={{
								showLineNumbers: true,
								tabSize: 2,
							}}
							editorProps={{ $blockScrolling: true }}
						/>
					) : (
						<pre style={{ width: 300 }}>{JSON.stringify(res, null, 4)}</pre>
					)
				}
				title={(
					<Row>
						<Col span={isEditable ? 19 : 18}>
							<h5 style={{ display: 'inline-block' }}>
								{isEditable ? 'Edit JSON' : 'JSON Result'}
							</h5>
						</Col>
						<Col span={isEditable ? 5 : 6}>
							<Tooltip visible={copied} title="Copied">
								<Button
									shape="circle"
									icon="copy"
									size="small"
									onClick={() => this.copyJSON(res)}
								/>
							</Tooltip>
							{isEditable ? (
								<Button
									size="small"
									type="primary"
									style={{ marginLeft: '5px' }}
									disabled={!isValidJSON}
									onClick={() => this.handleUpdateJSON(editorValue)}
								>
									Update
								</Button>
							) : (
								<Button
									size="small"
									type="primary"
									style={{ marginLeft: '5px' }}
									disabled={!isValidJSON}
									onClick={() => this.handleEditing()}
								>
									Edit
								</Button>
							)}
						</Col>
					</Row>
				)}
			>
				<Button shape="circle" icon="file-text" style={{ marginRight: '5px' }} />
			</Popover>
		);
	};

	render() {
		const {
			componentProps,
			appName,
			credentials,
			url,
			mappings,
			customProps,
			onPropChange,
			mappingsType,
		} = this.props;
		const { renderKey, showModal, showVideo } = this.state;
		let resultComponentProps = componentProps.result || {};
		resultComponentProps = {
			size: 5,
			pagination: true,
			paginationAt: 'bottom',
			scrollTarget: 'result',
			...resultComponentProps,
			onData: (res, triggerClickAnalytics) => {
				const { _id, _index, ...renderedJSON } = res;
				return (
					<div className={listItem} key={res._id} onClick={triggerClickAnalytics}>
						<ExpandCollapse previewHeight="390px" expandText="Show more">
							{<Tree showLine>{this.renderAsTree(renderedJSON)}</Tree>}
						</ExpandCollapse>
						<div style={{ marginTop: 10, textAlign: 'right' }}>
							{this.renderJSONEditor(res)}
							{this.renderDeleteJSON(res)}
						</div>
					</div>
				);
			},
			react: {
				and: Object.keys(componentProps).filter(item => item !== 'result'),
			},
		};
		const title = (
			<span>
				Search Preview{' '}
				{window.innerWidth > 1280 ? (
					<Button style={{ float: 'right' }} onClick={this.handleVideoModal} size="small">
						Watch Video
					</Button>
				) : null}
			</span>
		);
		return (
			<ReactiveBase app={appName} credentials={credentials} url={url} analytics>
				<Row gutter={16} style={{ padding: 20 }}>
					<Col span={6}>
						<Card title={title} id="video-title">
							<Button
								style={{ width: '100%' }}
								size="large"
								icon="plus-circle-o"
								className="search-tutorial-3"
								onClick={this.showModal}
							>
								Add New Filter
							</Button>
						</Card>
						{Object.keys(componentProps)
							.filter(item => item !== 'search' && item !== 'result')
							.map(config => (
								<Card key={config} style={{ marginTop: 20 }}>
									<RSWrapper
										id={config}
										component="MultiList"
										mappings={mappings}
										customProps={customProps}
										componentProps={componentProps[config] || {}}
										onPropChange={onPropChange}
										onDelete={this.props.deleteComponent}
										full
									/>
								</Card>
							))}
					</Col>
					<Col span={18}>
						<Card>
							<RSWrapper
								id="search"
								component={
									this.props.useCategorySearch ? 'CategorySearch' : 'DataSearch'
								}
								mappings={mappings}
								customProps={customProps}
								componentProps={componentProps.search || {}}
								onPropChange={onPropChange}
							/>
						</Card>

						<Card>
							<SelectedFilters />
							<RSWrapper
								id="result"
								component="ReactiveList"
								key={renderKey}
								mappings={mappings}
								customProps={customProps}
								mappingsType={mappingsType}
								componentProps={resultComponentProps}
								renderJSONEditor={this.renderJSONEditor}
								renderDeleteJSON={this.renderDeleteJSON}
								onPropChange={onPropChange}
								full
								showDelete={false}
							/>
						</Card>
					</Col>

					<Modal
						title="Add New Filter"
						visible={showModal}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						okText="Add"
						destroyOnClose
					>
						{this.renderPropsForm()}
					</Modal>
					<Modal
						title="Search Preview: 1 min walkthrough"
						visible={showVideo}
						onOk={this.handleVideoModal}
						onCancel={this.handleVideoModal}
						destroyOnClose
					>
						<iframe
							width="460"
							height="240"
							src="https://www.youtube.com/embed/f5SHz80r9Ro"
							frameBorder="0"
							title="Dejavu"
							allow="autoplay; encrypted-media"
							allowFullScreen
						/>
					</Modal>
				</Row>
			</ReactiveBase>
		);
	}
}

Editor.propTypes = {
	mappingsURL: PropTypes.string,
};

Editor.defaultProps = {
	mappingsURL: '/mappings',
};
