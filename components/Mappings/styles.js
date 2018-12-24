import styled, { css } from 'react-emotion';

const green = '#b6ef7e';
const greenHover = '#c3f295';
const grey = '#efefef';
const greyHover = '#fafafa';

export const card = css`
	width: 100%;
	max-width: 980px;
	margin: 25px auto;
	background-color: #fff;
	border-radius: 3px;
	box-sizing: border-box;

	i {
		margin: 3px 3px 0px 8px;
	}
`;

export const cardTitle = css`
	display: flex;
	justify-content: space-between;
	align-items: center;

	h4 {
		font-weight: 600;
		margin: 5px 0;
	}
	p {
		margin: 5px 0;
		color: rgba(0, 0, 0, 0.65);
		font-size: 14px;
		white-space: initial;
	}

	@media (max-width: 768px) {
		width: 100%;
		flex-direction: column;
		p {
			margin: 2px 0;
		}
	}
`;

export const HeaderWrapper = styled('div')`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;

	p {
		font-size: 13px;
		margin: 6px 0 0;
		color: #999;
	}
`;

export const Header = styled('header')`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	font-weight: 600;
	padding-top: 20px;

	@media (max-width: 700px) {
		flex-direction: column;
		padding: 0 10px;
	}

	.col-container {
		display: flex;
		justify-content: space-between;
	}

	.col {
		min-width: 150px;
		display: inline-flex;
		margin: 0 0 0 12px;
		text-align: center;

		&:first-child {
			margin: 0;
		}

		&.col--grow {
			flex-grow: 1;
		}

		@media (max-width: 460px) {
			min-width: 80px;
		}
	}
`;

export const heading = css`
	font-size: 16px;
	letter-spacing: 0.015rem;
	font-weight: 600;
	margin: 0;
	padding: 0;
`;

export const row = css`
	box-sizing: border-box;
	background-color: rgba(0, 0, 0, 0.02);
	padding: 15px 0 15px 15px;
	margin: 15px 0;
	border: 1px solid rgba(0, 0, 0, 0.05);
`;

export const title = css`
	font-size: 15px;
	letter-spacing: 0.015rem;
	font-weight: 600;
	margin: 0 0 12px 0;
	padding: 0;
`;

export const dropdown = css`
	min-width: 150px;
	margin-left: 12px;
	text-transform: capitalize;
	align-items: center;
	justify-content: space-between;
	display: flex;

	@media (max-width: 700px) {
		margin-left: 0px;
		margin-top: 10px;
		padding: 0;
	}

	@media (max-width: 460px) {
		min-width: 80px;
	}
`;

export const item = css`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 10px;
	margin-bottom: 2px;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.8);

	@media (max-width: 700px) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const subItem = css`
	display: flex;
	flex-direction: row;
	align-items: center;

	@media (max-width: 700px) {
		width: 100%;
		justify-content: space-between;
	}
`;

export const Footer = styled('footer')`
	position: sticky;
	bottom: 0;
	width: 100%;
	height: 66px;
	box-shadow: 0 -3px 5px 0 rgba(0, 0, 0, 0.02);
	background-color: #fff;
	transition: all 0.3s ease;
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
	padding: 0 20px;
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
`;

export const Button = styled('a')`
	display: inline-flex;
	height: 42px;
	padding: 0 20px;
	justify-content: center;
	align-items: center;
	color: #53683b;
	font-weight: 600;
	background-color: ${props => (props.ghost ? grey : green)};
	text-transform: uppercase;
	box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.1);
	cursor: pointer;
	margin-left: 12px;

	&:hover,
	&:focus {
		background-color: ${props => (props.ghost ? greyHover : greenHover)};
		box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.1);
		text-decoration: none;
	}
`;

export const deleteBtn = css`
	display: flex;
	flex-grow: 1;
	alignitems: center;
	flex-direction: row;
	cursor: pointer;

	@media (max-width: 700px) {
		width: 100%;
		font-weight: 600;
	}

	span {
		max-width: calc(100% - 40px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	a {
		display: none;
		cursor: pointer;
		color: #444;
		margin-left: 15px;
		transition: all 0.3s ease;
		color: tomato;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		@media (max-width: 700px) {
			display: inline-flex;
		}
	}

	&:hover a,
	&:focus a {
		display: inline-flex;

		&:hover,
		&:focus {
			color: red;
		}
	}
`;

export const inputStyles = css`
	diplay: flex;
	flex-grow: 1;
	min-width: 150px;
`;

export const ErrorLogger = styled('pre')`
	height: auto;
	max-height: 200px;
	overflow-y: scroll;
	width: 100%;
	background-color: #eee;
	padding: 10px;
	font-family: monospace;
	font-size: 14px;
`;

export const promotionContainer = css`
	display: flex;
	flex-direction: row;

	.promotional-button {
		margin-left: 5px;
	}

	@media (max-width: 768px) {
		width: 100%;
		flex-direction: column;
		align-items: baseline;

		.promotional-button {
			margin: 5px 0;
		}
	}
`;
