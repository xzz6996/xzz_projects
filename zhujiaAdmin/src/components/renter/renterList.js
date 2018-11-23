/* eslint-disable */
import React from 'react';
import { Form, Row, Col, Input, Button,Table,message,Radio,Modal} from 'antd';
import API from '../../api';
import { connect } from 'dva';
import emitter from '../../utils/events';
import styles from '../work/mywork.css';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
/*创建搜索表单*/
class AdvancedSearchForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			options:[],
		}
	}
	componentWillMount(){
		
	}
  	handleSearch = (e) => {
    	e.preventDefault();
    	this.props.form.validateFields((err, values) => {
      		//console.log('Received values of form: ', values);
      		if(err){

      		}else{
      			this.props.dispatch({
      				type:'loading/update',
      				loading:true
      			})
      			emitter.emit('changeRentList', values);
      		}
    	});
  	}
  	handleReset = () => {
    	this.props.form.resetFields();
  	}
  	handleChange = (value) => {
  		//console.log(`Selected: ${value}`);
  	}
  	onChange(checkedValues){
  		//console.log('checked = ', checkedValues);
  	}
  	render() {
  		const { getFieldDecorator } = this.props.form;
	    return (
	      	<Form
	        	className="ant-advanced-search-form"
	        	onSubmit={this.handleSearch}
	        	layout="inline"
	      	>
	        	<Row gutter={24}>
	        		<Col xl={8} lg={12}>
		          		<FormItem label='手机号'>
		          			{getFieldDecorator('userPhone', {
					            rules: [{ required: false}],
					        })(
					            <Input placeholder="请输入手机号" />
					        )}
		          		</FormItem>
	        		</Col>
	        		<Col xl={8} lg={12}>
		          		<FormItem label='姓名'>
		          			{getFieldDecorator('userName', {
					            rules: [{ required: false}],
					        })(
					            <Input placeholder="请输入租客姓名" />
					        )}
		          		</FormItem>
	        		</Col>
	        	</Row>
	        	<Row>
	          		<Col span={24} style={{ textAlign: 'right' }}>
	            		<Button type="primary" htmlType="submit" loading={this.props.loading.loading}>查询</Button>
	           		 	<Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleReset}>
	              			重置
	            		</Button>
	          		</Col>
	        	</Row>
	      </Form>
	    );
	}
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
const WrappedFrom = connect(mapStateToProps)(WrappedAdvancedSearchForm);
/*创建表格*/
class Tables extends React.Component {
  	constructor(props) {
    	super(props);
	    this.state = {
	      	data:[],
	      	columns:[
	      		{
				  	title: '编号',
				  	dataIndex: 'index',
				},{
				  	title: '租客手机号',
				  	dataIndex: 'userPhone',
				},{
				  	title: '是否实名',
				  	/*dataIndex: 'isRealName',*/
				  	render:(record) => {
				  		if(record.isRealName){
				  			return '是';
				  		}else{
				  			return '否'
				  		}
				  	}
				},{
				  	title: '租客姓名',
				  	dataIndex: 'userRealName',
				},{
				  	title: '注册日期',
				  	/*dataIndex:'gmtCreate',*/
				  	render:(record) => this.renderTime(record.gmtCreate)
				},{
				  	title: '是否已租房',
				  	/*dataIndex:'isRent',*/
				  	render:(record) => {
				  		if(record.isRent){
				  			return '是';
				  		}else{
				  			return '否'
				  		}
				  	}
				}
	      	],
            values: {
            	userPhone:'',
            	userName:'',
            },
            loading: false,
			pagination: {
				current:1,
				pageSize:10
			},
			accountId:'',//登录的id
	    };
	    this.cacheData = this.state.data.map(item => ({ ...item }));
    	this.handleTableChange = this.handleTableChange.bind(this);
	}
	componentWillMount(){
		if(window.sessionStorage.getItem('loginMsg')){
			let userObj = JSON.parse(window.sessionStorage.getItem('loginMsg'));
			this.setState({
				accountId:userObj.id
			},() => {
				let obj = {
					pageNum:1,
					pageSize:10,
					accountId:this.state.accountId
				}
				this.getList(obj)
			})	
		}
	}
    componentDidMount(){
	    emitter.addListener('changeRentList', (values) => {
	    	const pager = {
	    		current:1,
	    		pageSize:10
	    	};
		    this.setState({
		        values,
		        pagination:pager
		    },()=>{
		    	//console.log(this.state.values.roleCodes);
			    let obj = {
			    	userPhone:this.state.values.userPhone,
			    	userName:this.state.values.userName,
			    	pageNum:this.state.pagination.current,
			    	pageSize:10,
			    	accountId:this.state.accountId
			    };
			    this.getList(obj)
		    });
	    });
	} 
  	handleTableChange = (pagination, filters, sorter) => {
  		//console.log(pagination);
    	const pager = pagination;
    	pager.current = pagination.current;
	    this.setState({
	      pagination: pager,
	    },() => {
	    	let obj = {
	    		userPhone:this.state.values.userPhone,
				userName:this.state.values.userName,
				pageNum:this.state.pagination.current,
				pageSize:10,
				accountId:this.state.accountId
		    };
			this.getList(obj)
	    });
		    
	}
    getList = (obj) => {
    	let _this = this;
    	this.props.dispatch({
			type:'loading/updateTable',
			tableLoading:true
		})
    	API.RenterList(obj)
        .then(res => {
            //console.log(res)
            this.props.dispatch({
				type:'loading/updateTable',
				tableLoading:false
			})
	      	this.props.dispatch({
  				type:'loading/update',
  				loading:false
  			})
            if((res.status == 200) && (res.data.success)){
            	let list = res.data.data;
            	if(list){
            		list.map((item,index) => {
	            	    if(index < 10){
            				item.index = (_this.state.pagination.current-1)+''+index;
            			}else{
            				item.index = index;
            			}
	            	            	})
            	}
            	const pagination = { ...this.state.pagination };
            	pagination.total = res.data.count;
            	this.setState({
		        	data:list,
		        	pagination,
		      	});
            }
        }).catch(error => {
        	this.props.dispatch({
				type:'loading/updateTable',
				tableLoading:false
			})
	      	this.props.dispatch({
  				type:'loading/update',
  				loading:false
  			})
        })
    }
  	renderTime = (time) => {
  		let date = new Date(time);
  		let Y = date.getFullYear() + '-';
        let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        let D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes() ) + ':';
        let s = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
        //console.log(Y+M+D+h+m+s)
        return Y+M+D+h+m+s;
  	}
  	render() {
    	return (
      		<div className={styles.tableWrapChild}>
        		<Table 
	        		columns={this.state.columns} 
	        		dataSource={this.state.data}
	        		loading={this.props.loading.tableLoading}
			    	pagination={this.state.pagination} 
			    	style={{width:'94%',margin:' 0 auto',marginTop:' 50px'}}
			    	onChange={this.handleTableChange}
			    	rowKey={record => record.id}
			    	size="small"
	        		bordered />
      		</div>
    	);
  	}
  	componentWillUnmount () {  
    	//当组件将要卸载的时候，取消监听  
     	emitter.removeAllListeners('changeRentList',() => {
     		
     	});
  	}
}
const WrappedTables = connect(mapStateToProps)(Tables);
class RenterList extends React.Component{
	render(){
		return (
		    <div>
		    	<div className={styles.formWrap}>
			        <WrappedFrom />
			    </div>
			    <div className={styles.tableWrap}>
			    	<WrappedTables />
			    </div>
		    </div>
		);
	}	  
};
function mapStateToProps({loading}) {
    return {loading};
}
export default RenterList;