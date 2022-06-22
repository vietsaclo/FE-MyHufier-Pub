import React, { Component } from 'react';
import { Button, Radio } from 'antd';
import { Table } from 'antd';
import { Apis } from '../../../../common/utils/Apis';
import { MessageKeys, NotificationKeys } from '../../../../common/utils/keys';
import { connect } from 'react-redux';
import { ActionType } from '../../../../common/utils/actions-type';
import { DeleteTwoTone, EditTwoTone } from '@ant-design/icons';
import RoleUser from '../../../../common/utils/keys/RoleUserKey';
import FACTORY from '../../../../common/FACTORY';
import ButtonAddNewTagsComponent from './components/ButtonAddNewTagsComponent';
import PagingComponent from '../../../common/PagingComponent';

// import loadable from '@loadable/component';
// const ButtonAddNewTagsComponent = loadable(() => import('./components/ButtonAddNewTagsComponent'));
// const PagingComponent = loadable(() => import('../../../common/PagingComponent'));

class TagsComponent extends Component {
  constructor(props) {
    super(props);
    this.dispatch = this.props.dispatch;
    this.user = FACTORY.fun_getUserLoginLocalStorage();
    this.isAdmin = this.user && this.user.role === RoleUser.ADMIN;
    this.state = {
      data: [],
      loadingBtnEdit: false,
      total: 0,
      valueRadioUserPost: 1,
    };
  }

  columns = [
    {
      title: 'Tag', key: '1', width: 70,
      fixed: 'left',
      render: (obj) => {
        return (
          <div className='text-capitalize'>{obj.name}</div>
        );
      }
    },
    {
      title: 'Create At', key: '4', width: 100,
      render: (obj) => {
        const date = new Date(obj.createAt);
        return (
          <div className='text-center'>{date.toUTCString()}</div>
        );
      }
    },
    {
      title: 'Update At', key: '5', width: 100,
      render: (obj) => {
        const date = new Date(obj.updateAt);
        return (
          <div className='text-center'>{date.toUTCString()}</div>
        );
      }
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 50,
      render: (obj) => {
        return (
          <>
            <Button icon={<EditTwoTone />} loading={this.state.loadingBtnEdit} onClick={() => this.btnEditClicked(obj)} style={{ marginBottom: '5px' }} type='link' block></Button>
            <Button icon={<DeleteTwoTone twoToneColor='#eb2f96' />} onClick={() => this.btnDeleteClicked(obj)} type='link' block danger></Button>
          </>
        );
      },
    },
  ];

  componentDidMount() {
    window.scrollTo(0, 0);
    const tokens = FACTORY.fun_getTokenAndRefreshTokenLocalStorage();
    if (!this.user || !tokens) return;
    this.loadAllTags();
  }

  async btnEditClicked(obj) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    this.setState({
      loadingBtnEdit: true,
      onEdit: null,
    });
    // get detail post
    const dataRes = await PublicModules.fun_get(
      Apis.API_HOST + Apis.API_TAILER.TAG_NAME + obj.id,
      PublicModules.fun_getConfigBearerDefault({}),
    )
    // error ?
    if (!dataRes.success) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Load detail tag error',
        message: PublicModules.fun_mapErrorToMessage(dataRes.message),
      });
      this.setState({
        loadingBtnEdit: false,
        onEdit: null,
      });
      return;
    }

    this.setState({
      loadingBtnEdit: false,
      onEdit: dataRes.data,
    });
  }

  async btnDeleteClicked(obj) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // show confirm
    const okDelete = await CoreUI.fun_showConfirm({
      title: `Xóa Tag [ ${obj.name} ]`,
      message: 'Hành đồng xóa bạn có chắc chứ ?',
    });
    if (!okDelete) return;

    // show loading
    const keyDelLoading = CoreUI.fun_showNotification({
      type: NotificationKeys.LOADING,
      title: 'Đang xóa Tag',
      message: `Đang thực hiện xóa tag [ ${obj.name} ]`,
    });

    // delete on db
    const dataRes = await PublicModules.fun_delete(
      Apis.API_HOST + Apis.API_TAILER.TAG_NAME + obj.id,
      PublicModules.fun_getConfigBearerDefault({}),
    );

    // close loading
    CoreUI.fun_closeNotificationLoading(keyDelLoading);

    // error ?
    if (!dataRes.success) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Không thành công !',
        message: PublicModules.fun_mapErrorToMessage(dataRes.message),
      });
      return;
    }

    // success
    // remove in state
    if (!this.state.data || this.state.data.lenght === 0) return;
    this.setState({
      data: this.state.data.filter((e) => e.id !== obj.id),
      total: this.state.total - 1,
    });

    CoreUI.fun_showNotification({
      type: NotificationKeys.SUCCESS,
      title: 'Xóa thành công',
      message: `Thực hiện xóa Tag [ ${obj.name} ] thành công.`,
    });
  }

  async loadAllTags() {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    this.setState({
      isLoading: true,
    });
    let url = Apis.API_HOST + Apis.API_TAILER.TAG_NAME;
    url = url.substring(0, url.length - 1);
    url += `?isBlackMarket=${this.state.valueRadioUserPost === 0}`;
    const dataRes = await PublicModules.fun_get(
      url,
    );
    // error ?
    if (!dataRes.success) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Tải Tags bị lỗi',
        message: MessageKeys.CHECK_CONNECTION,
      });
      this.setState({
        isLoading: false,
      });
      return;
    }

    //set state
    this.setState({
      data: dataRes.data.map((v, k) => {
        v['key'] = k;
        return v;
      }),
      total: dataRes.total,
      isLoading: false,
    });
  }

  onPageChange = (page, pageSize) => {
    this.dispatch({
      type: ActionType.POST_MANAGE_UPDATE,
      value: { ...this.props.managePost, page: page, limit: pageSize },
    });
    window.scrollTo(0, 0);
  };

  componentWillReceiveProps(nextProps) {
    this.loadAllTags(nextProps.managePost);
  }

  valueRadioUserPostChange(e) {
    const value = e.target.value;
    this.setState({ valueRadioUserPost: value }, () => {
      this.loadAllTags();
    });
  }

  render() {
    return (
      <div className='h-100 mt-4'>
        {FACTORY.fun_getGl_loading(this.state.isLoading)}
        <div className='float-start'>
          <ButtonAddNewTagsComponent
            onEdit={this.state.onEdit}
            onRefresh={() => this.loadAllTags()}
            isBlackMarket={this.state.valueRadioUserPost === 0}
          />
        </div>
        <div className='float-end p-3 bg-border hover mb-2'>
          <Radio.Group onChange={(e) => this.valueRadioUserPostChange(e)} value={this.state.valueRadioUserPost} >
            <Radio value={1}>Bài viết</Radio>
            <Radio value={0}>Bán sách</Radio>
          </Radio.Group>
        </div>
        <br />
        <Table
          pagination={false}
          columns={this.columns} dataSource={this.state.data} />
        <PagingComponent
          total={this.state.total}
          onPageChange={(page, pageSize) => this.onPageChange(page, pageSize)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, _ownProps) => {
  return {
    adminRouter: state.adminRouter.router,
    managePost: state.managePost,
  }
}

export default connect(mapStateToProps)(TagsComponent);