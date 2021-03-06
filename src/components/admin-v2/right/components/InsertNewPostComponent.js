import React, { Component } from 'react';
import { Button, Input, message, Radio, Slider, Switch } from "antd";
import { connect } from 'react-redux';
import { ImageUploadKeys, MessageKeys, NotificationKeys } from "../../../../common/utils/keys";
import { Apis } from '../../../../common/utils/Apis';
import { ActionType, AdminRouterType } from '../../../../common/utils/actions-type';
import TextArea from 'antd/lib/input/TextArea';
import { DeleteOutlined } from '@ant-design/icons';
import FACTORY from '../../../../common/FACTORY';
import SelectCategoryComponent from './components/SelectCategoryComponent';
import SelectTagsComponents from './components/SelectTagNameComponent';
import LoadingComponent from '../../../common/LoadingComponent';
import ButtonDownload from '../../../common/ButtonDownload';
import ButtonInsertLinkDownload from '../../../common/ButtonInsertLinkDonload';
import ButtonAddNewCategoryComponent from './components/ButtonAddNewCategoryComponent';
import ButtonAddNewTagsComponent from './components/ButtonAddNewTagsComponent';
import QuestionAnserComponent from './components/QuestionAnserComponent';
import CkeditorComponent from '../../../common/CkeditorComponent';
import RoleUser from '../../../../common/utils/keys/RoleUserKey';

// import loadable from '@loadable/component';
// const CkeditorComponent = loadable(() => import('../../../common/CkeditorComponent'));
// const SelectCategoryComponent = loadable(() => import('./components/SelectCategoryComponent'))
// const SelectTagsComponents = loadable(() => import('./components/SelectTagNameComponent'));
// const LoadingComponent = loadable(() => import('../../../common/LoadingComponent'));
// const ButtonDownload = loadable(() => import('../../../common/ButtonDownload'));
// const ButtonInsertLinkDownload = loadable(() => import('../../../common/ButtonInsertLinkDonload'));
// const ButtonAddNewCategoryComponent = loadable(() => import('./components/ButtonAddNewCategoryComponent'));
// const ButtonAddNewTagsComponent = loadable(() => import('./components/ButtonAddNewTagsComponent'));
// const QuestionAnserComponent = loadable(() => import('./components/QuestionAnserComponent'));

const KEY_LOADING_LOAD_ALL_CATE = 'KEY_LOADING_LOAD_ALL_CATE';
const KEY_LOADING_LOAD_ALL_TAGS = 'KEY_LOADING_LOAD_ALL_TAGS';

class InsertNewPostComponent extends Component {
  constructor(props) {
    super(props);
    this.dispatch = this.props.dispatch;
    const post = this.props.dataUpdate;
    this.state = {
      imageUploadType: ImageUploadKeys.SERVER,
      listCate: null,
      listTags: null,
      cateSelected: null,
      tagSelected: null,
      imageBannerUserSelected: null,
      isUpdate: post != null,
      cateUpdated: null,
      tagsUpdated: null,
      isCleanUp: false,
      title: post != null ? post.title : null,
      isTitled: post != null,
      loadingButtonSave: false,
      contentPost: post != null ? post.content : null,
      isSelectedMarket: post != null ? post.isBlackMarket : false,
      insertImageProducts: post == null ? [] : post.images.map((v) => {
        return {
          origin: { name: v },
          base64: null,
        };
      }),
      isAccessRule: false,
      isAccessNotRobot: -1,
      valueAcessNotRobotByUser: 0,
      countTryAgain: 0,
      descriptionSelected: post != null ? post.description : null,
      links: post != null ? FACTORY.fun_tryParseJSON(post.linksDownload) : [],
      tbBuy: post != null ? post.priceBuy : null,
      tbSell: post != null ? post.priceSell : null,
      valueRadioUserPost: 1,
    }
    this.userLoged = FACTORY.fun_getUserLoginLocalStorage();
    this.loadListCategory();
    this.loadListTags();
  }

  componentWillUnmount() {
    this.setState({
      isCleanUp: true,
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  getDataContentDefault() {
    if (this.state.isUpdate)
      return this.props.dataUpdate.content;
    return null;
  }

  tbTitleChange(e) {
    const value = e.target.value;
    if (value) {
      this.setState({
        isTitled: true,
        title: value,
      });
    }
    else {
      this.setState({
        isTitled: false,
        title: null,
      })
    }
  }

  async uploadImagesForBlackMarket() {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    let images = '';
    const end = ';vsl;';
    const list = this.state.insertImageProducts;
    for (let i = 0; i < list.length; i++) {
      let data = '';
      if (list[i].base64 == null)
        data = { fileName: list[i].origin.name };
      else
        data = await PublicModules.fun_uploadAnImageToServer(list[i].origin, this.state.imageUploadType);
      if (data) {
        images += data.fileName;
        if (i !== list.length - 1)
          images += end;
      }
    }
    return images;
  }

  async handleInsert(cate, contentPost, linksDownload) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // is user selected image banner ?
    let imageUrl = cate.imageBanner;
    let imageUploadType = ImageUploadKeys.SERVER;
    const imageUserSelected = this.state.imageBannerUserSelected;
    if (!imageUserSelected) {
      const ok = await CoreUI.fun_showConfirm({
        title: 'B???n ch??a ch???n h??nh ?????i di???n cho b??i vi???t',
        message: 'B???n c?? mu???n d??ng h??nh ?????i di???n hi???n t???i kh??ng ?',
      });
      if (!ok) {
        this.setState({
          loadingButtonSave: false,
        });
        return;
      }
    }

    // upload image to imgur
    if (imageUserSelected) {
      const data = await PublicModules.fun_uploadAnImageToServer(imageUserSelected.origin, this.state.imageUploadType);
      if (!data) {
        this.setState({
          loadingButtonSave: false,
        });
        return;
      }
      imageUrl = data.fileName;
      imageUploadType = this.state.imageUploadType;
    }

    // black market ?
    const imagesString = await this.uploadImagesForBlackMarket();

    // posting to server
    // show loading
    const keyPostLoading = CoreUI.fun_showNotification({
      type: NotificationKeys.LOADING,
      message: '??ang ????ng b??i vi???t c???a b???n, xin h??y ch??? trong gi??y l??t.',
    });

    // post
    const dataPostRes = await PublicModules.fun_post(
      Apis.API_HOST + Apis.API_TAILER.POST,
      {
        title: this.state.title,
        imageBanner: imageUrl,
        content: contentPost,
        imageUploadType: imageUploadType,
        category: cate.id,
        tags: this.state.tagSelected,
        images: imagesString,
        description: this.state.descriptionSelected,
        linksDownload: linksDownload,
        isBlackMarket: this.state.isSelectedMarket,
        priceBuy: FACTORY.fun_parseNumberOrZero(this.state.tbBuy),
        priceSell: FACTORY.fun_parseNumberOrZero(this.state.tbSell),
      },
      PublicModules.fun_getConfigBearerDefault({}),
    );

    // close loading
    CoreUI.fun_closeNotificationLoading(keyPostLoading);

    // error ?
    if (!dataPostRes.success) {
      const message = PublicModules.fun_mapErrorToMessage(dataPostRes.message);
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: '????ng b??i vi???t b??? l???i',
        message: message,
      });
      this.setState({
        loadingButtonSave: false,
      });
      return;
    }

    // success
    CoreUI.fun_showNotification({
      type: NotificationKeys.SUCCESS,
      title: '????ng b??i vi???t th??nh c??ng',
      message: 'B??i vi???t c???a b???n ???????c ????ng l??n th??nh c??ng',
    });

    this.dispatch({
      type: ActionType.ADMIN_ROUTER_UPDATE,
      router: AdminRouterType.ALL_POST,
    });
  }

  async handleUpdate(obj, contentPost, linksDownload) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // is user selected image banner ?
    let imageUrl = obj.imageBanner;
    let imageUploadType = obj.imageUploadType;
    const imageUserSelected = this.state.imageBannerUserSelected;

    // upload image to imgur
    if (imageUserSelected) {
      const data = await PublicModules.fun_uploadAnImageToServer(imageUserSelected.origin, this.state.imageUploadType);
      if (!data) {
        this.setState({
          loadingButtonSave: false,
        });
        return;
      }
      imageUrl = data.fileName;
      imageUploadType = this.state.imageUploadType;
    }

    // black market ?
    const imagesString = await this.uploadImagesForBlackMarket();

    // posting to server
    // show loading
    const keyPostLoading = CoreUI.fun_showNotification({
      type: NotificationKeys.LOADING,
      message: '??ang ????ng b??i vi???t c???a b???n, xin h??y ch??? trong gi??y l??t.',
    });

    // post
    const dataPostRes = await PublicModules.fun_put(
      Apis.API_HOST + Apis.API_TAILER.POST + obj.id,
      {
        title: this.state.title,
        imageBanner: imageUrl,
        content: contentPost,
        imageUploadType: imageUploadType,
        category: this.state.cateSelected.id,
        tags: this.state.tagSelected,
        images: imagesString,
        description: this.state.descriptionSelected,
        linksDownload: linksDownload,
        isBlackMarket: this.state.isSelectedMarket,
        priceBuy: FACTORY.fun_parseNumberOrZero(this.state.tbBuy),
        priceSell: FACTORY.fun_parseNumberOrZero(this.state.tbSell),
      },
      PublicModules.fun_getConfigBearerDefault({}),
    );

    // close loading
    CoreUI.fun_closeNotificationLoading(keyPostLoading);

    // error ?
    if (!dataPostRes.success) {
      const message = PublicModules.fun_mapErrorToMessage(dataPostRes.message);
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: '????ng b??i vi???t b??? l???i',
        message: message,
      });
      this.setState({
        loadingButtonSave: false,
      });
      return;
    }

    // success
    CoreUI.fun_showNotification({
      type: NotificationKeys.SUCCESS,
      title: 'C???p nh???t b??i vi???t th??nh c??ng',
      message: 'B??i vi???t c???a b???n ???????c c???p nh???t th??nh c??ng',
    });

    this.dispatch({
      type: ActionType.ADMIN_ROUTER_UPDATE,
      router: AdminRouterType.ALL_POST,
    });
  }

  async btnSaveClicked() {
    const CoreUI = await FACTORY.GET_CORE_UI();
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    // check access rule
    if (this.userLoged.role === RoleUser.MEM) {
      if (!this.state.isAccessRule) {
        CoreUI.fun_showNotification({
          type: NotificationKeys.ERROR,
          title: 'B???n ch??a ?????ng ?? v???i ??i???u kho???n',
          message: 'H??y ?????ng ?? v???i ??i???u kho???n c???a trang web v?? ti???p t???c t??c v???! Thank ^^'
        });
        return;
      }

      // check count try again
      if (this.state.countTryAgain === 3) {
        await CoreUI.fun_showConfirm({
          title: '???? qu?? m???c l?????t th??? l???i',
          message: 'Ch??? cho ph??p sai qu?? 3 l???n th??i nh??, l???n sau b???n c??? g???ng l??n: Fitting...',
        });
        this.dispatch({
          type: ActionType.ADMIN_ROUTER_UPDATE,
          router: AdminRouterType.ALL_POST,
        });
        return;
      }

      // check access not robot.
      if (this.state.isAccessNotRobot !== this.state.valueAcessNotRobotByUser) {
        const newNumber = FACTORY.fun_random1To100();
        this.setState({
          isAccessNotRobot: newNumber,
          countTryAgain: this.state.countTryAgain += 1,
        });
        CoreUI.fun_showNotification({
          type: NotificationKeys.ERROR,
          title: 'Thanh tr?????c kh??ng kh???p !',
          message: `L??m ??n h??y k??o thanh tr?????c kh???p v???i s???  ${newNumber} ???? hi???n th???, Thank ^^`
        });
        return;
      }
    }

    // button download
    if (!this.state.isSelectedMarket && this.state.links.length === 0) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Ch??a c?? link download cho b??i vi???t',
        message: 'H??y nh???p link download cho b??i vi???t nh??'
      });
      return;
    }
    const list = this.state.links;
    let linksDownload = '[';
    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      linksDownload += `{
        "title": "${v.title}",
        "link": "${v.link}"
      }`
      if (i !== list.length - 1)
        linksDownload += ',';
    }
    linksDownload += ']';

    // user slected cate ?
    const cate = this.state.cateSelected;
    if (!cate) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Ch??a c?? th??? lo???i cho b??i vi???t',
        message: 'H??y ch???n th??? lo???i cho b??i vi???t nh??'
      });
      return;
    }

    // user title ?
    let title = this.state.title || '';
    title = title.trim();
    if (!this.state.isTitled || title === '') {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Ch??a c?? Title cho b??i vi???t',
        message: 'H??y ch???n Title cho b??i vi???t nh??'
      });
      return;
    }
    if (title.length > 100) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Title qu?? d??i',
        message: 'H??y nh???p ??t h??n 100 k?? t???.'
      });
      return;
    }

    // user description ?
    let descriptionSelected = this.state.descriptionSelected || '';
    descriptionSelected = descriptionSelected.trim();
    if (!descriptionSelected || descriptionSelected === '') {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Ch??a c?? m?? t??? ng???n cho b??i vi???t',
        message: 'H??y vi??t m?? t??? ng???n cho b??i vi???t nh??'
      });
      return;
    }
    if (descriptionSelected.length > 190) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'M?? t??? ng???n qu?? d??i',
        message: 'H??y nh???p ??t h??n 190 k?? t???.'
      });
      return;
    }

    // user content ?
    // content post
    const contentPost = this.state.isSelectedMarket ? '' : this.state.contentPost;
    if (!this.state.isSelectedMarket && !contentPost) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Ch??a c?? nh???p n???i dung cho b??i vi???t',
        message: 'H??y nh???p n???i dung cho b??i vi???t nh??'
      });
      return;
    }

    // check length content
    const lengthPost = contentPost.length;
    if (lengthPost > 10000) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'N???i dung b??i vi???t qu?? d??i !',
        message: 'Hi???n t???i ch??? h??? tr??? b??i vi???t < 10.000 t???.'
      });
      return;
    }

    // show confirm
    const ok = await CoreUI.fun_showConfirm({
      title: this.state.isUpdate ? 'H??nh ?????ng c???p nh???t b??i vi???t' : 'H??nh ?????ng ????ng b??i vi???t',
      message: 'Nh???n OK ????? x??c nh???n c???p nh???t b??i vi???t n??y',
    });
    if (!ok) return;

    // loading button -> disable user clicked
    this.setState({
      loadingButtonSave: true,
    });

    // check auth
    const isAuth = await PublicModules.fun_get(
      Apis.API_HOST + Apis.API_TAILER.AUTH,
      PublicModules.fun_getConfigBearerDefault({}),
    );
    if (!isAuth.success) {
      this.setState({
        loadingButtonSave: false,
      });
      return;
    }

    // Upload image banner first.
    if (this.state.isUpdate)
      await this.handleUpdate(this.props.dataUpdate, contentPost, linksDownload);
    else
      await this.handleInsert(cate, contentPost, linksDownload);
  }

  async loadListTags() {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // load list tags from db
    let url = Apis.API_HOST + Apis.API_TAILER.TAG_NAME;
    url = url.substring(0, url.length - 1);
    url += `?isBlackMarket=${this.state.isSelectedMarket || false}`;
    PublicModules.fun_get(
      url,
    ).then((dataRes) => {
      // error ?
      if (!dataRes.success) {
        CoreUI.fun_showNotification({
          type: NotificationKeys.ERROR,
          title: 'T???i th??? cho b??i vi???t b??? l???i!',
          message: MessageKeys.CHECK_CONNECTION,
        });
        message.error({ content: 'Tags Load Faild!', key: KEY_LOADING_LOAD_ALL_TAGS, duration: 1 });
        return;
      }

      // update state
      // is action edit this post ?
      if (this.state.isUpdate) {
        const tags = this.props.dataUpdate.tags.map((v) => {
          return v.id.toString();
        });
        this.setState({
          listTags: dataRes.data,
          tagsUpdated: tags,
          tagSelected: tags,
        });
      }
      else
        this.setState({
          listTags: dataRes.data,
          tagsUpdated: [],
        });
    });
  }

  async loadListCategory() {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // load cate from db
    let url = Apis.API_HOST + Apis.API_TAILER.CATE;
    url = url.substring(0, url.length - 1);
    url += `?isBlackMarket=${this.state.isSelectedMarket || false}`;
    PublicModules.fun_get(
      url,
    ).then((dataRes) => {
      // error ?
      if (!dataRes.success) {
        CoreUI.fun_showNotification({
          type: NotificationKeys.ERROR,
          title: 'T???i th??? lo???i b??i vi???t b??? l???i',
          message: MessageKeys.CHECK_CONNECTION,
        });
        message.error({ content: 'Cates Load Faild!', key: KEY_LOADING_LOAD_ALL_CATE, duration: 1 });
        return;
      }

      // update state
      // is action edit this post ?
      if (this.state.isUpdate)
        this.setState({
          listCate: dataRes.data,
          cateUpdated: this.props.dataUpdate.cate.name,
          cateSelected: this.props.dataUpdate.cate,
        });
      else
        this.setState({
          listCate: dataRes.data,
        });
    });
  }

  selectCateChange(cateId) {
    if (!cateId) return;
    const cateSelected = this.state.listCate.find((e) => String(e.id) === String(cateId));
    this.setState({
      cateSelected: cateSelected,
      cateUpdated: cateSelected.name,
    });
  }

  selectTagsChange(tagId) {
    if (!tagId) return;
    if (this.state.isUpdate)
      this.setState({
        tagSelected: tagId,
        tagsUpdated: tagId,
      });
    else
      this.setState({
        tagSelected: tagId,
        tagsUpdated: tagId,
      });
  }

  getImageBanner() {
    if (this.state.imageBannerUserSelected)
      return (
        <img
          alt='banner'
          className="img-fluid w-50"
          src={this.state.imageBannerUserSelected.base64}
        />
      );
    // is update ?
    if (this.state.isUpdate) {
      const obj = this.props.dataUpdate;
      return (
        <img
          src={FACTORY.fun_getImageViewFromServer(obj.imageBanner, obj.imageUploadType)}
          className="img-fluid w-50"
          alt='img update'
        />
      );
    }
    if (this.state.cateSelected) {
      const cate = this.state.cateSelected;
      return (
        <img
          src={FACTORY.fun_getImageViewFromServer(cate.imageBanner, cate.imageUploadType)}
          className="img-fluid w-50"
          alt='cate default'
        />
      );
    }
  }

  async btnChooseBannerClicked(event) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    // check size: < 4 MB
    const maxSize = process.env.REACT_APP_MAX_SIZE_UPLOAD_MARKET;
    const size = file.size / 1024 / 1024;
    if (size > maxSize) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'File Qu?? l???n !',
        message: 'Hi???n t???i ch??? cho ph??p t???i ??a h??nh < 4 MB',
      });
      return;
    }
    const fileResize = await PublicModules.fun_resizeImage(file);
    if (!fileResize) return;
    // set state
    this.setState({
      imageBannerUserSelected: {
        origin: fileResize.origin,
        base64: fileResize.base64,
      },
    });
  }

  ckEditorChange(data) {
    this.setState({
      contentPost: data,
    })
  }

  async btnCancleUpdate() {
    const CoreUI = await FACTORY.GET_CORE_UI();
    // show cofirm
    const ok = await CoreUI.fun_showConfirm({
      title: 'B???n c?? ch???c h???y ?',
      message: `H???y b??? t??c v??? n??y ngay b??y gi??? ?`
    });
    if (!ok) return;

    // go all post
    this.dispatch({
      type: ActionType.ADMIN_ROUTER_UPDATE,
      router: AdminRouterType.ALL_POST,
    });
  }

  getButtonInserOrUpdate(dislayText) {
    return (
      <div className='row'>
        <div className='col-6'>
          <button
            className='btn-ds outline-sec block'
            onClick={() => this.btnCancleUpdate()}>H???y B???
          </button>
        </div>
        <div className='col-6'>
          <button
            className='btn-ds outline-pr block'
            onClick={() => this.btnSaveClicked()}>
            {dislayText}
          </button>
        </div>
      </div>
    );
  }

  async btnAddNewCateClicked() {
    const CoreUI = await FACTORY.GET_CORE_UI();
    CoreUI.fun_showNotification({
      type: NotificationKeys.INFO,
      title: 'Coming soon!',
      message: MessageKeys.COMING_SOON,
    });
  }

  async btnAddNewTagClicked() {
    const CoreUI = await FACTORY.GET_CORE_UI();
    CoreUI.fun_showNotification({
      type: NotificationKeys.INFO,
      title: 'Coming soon!',
      message: MessageKeys.COMING_SOON,
    });
  }

  getGl_loading() {
    if (this.state.loadingButtonSave)
      return (
        <LoadingComponent />
      );
  }

  async imgBannerClicked() {
    const CoreUI = await FACTORY.GET_CORE_UI();
    if (!this.state.imageBannerUserSelected) return;
    // show confirm
    const ok = await CoreUI.fun_showConfirm({
      title: 'X??a h??nh ?????i di???n n??y ?',
      message: 'B???n c?? ch???c mu???n x??a h??nh ?????i di???n n??y, h??y nh??? ch???n h??nh ?????i di???n cho b??i ????ng b???t m???t nh??.'
    });
    if (!ok) return;
    this.setState({
      imageBannerUserSelected: null,
    })
  }

  async insertImageProductChange(event) {
    const PublicModules = await FACTORY.GET_PUBLIC_MODULES();
    const CoreUI = await FACTORY.GET_CORE_UI();
    // set length
    const maxLength = process.env.REACT_APP_MAX_LENGTH_UPLOAD_MARKET;
    if (this.state.insertImageProducts.length > maxLength - 1) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'Kh??ng ???????c ph??p !',
        message: `Hi???n t???i ch??? cho upload t???i ??a ${maxLength} h??nh.`,
      });
      return;
    }

    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    // check size: < 4 MB
    const maxSize = process.env.REACT_APP_MAX_SIZE_UPLOAD_MARKET;
    const size = file.size / 1024 / 1024;
    if (size > maxSize) {
      CoreUI.fun_showNotification({
        type: NotificationKeys.ERROR,
        title: 'File Qu?? l???n !',
        message: 'Hi???n t???i ch??? cho ph??p t???i ??a h??nh < 4 MB',
      });
      return;
    }
    const fileResize = await PublicModules.fun_resizeImage(file);
    if (!fileResize) return;
    // set state
    this.setState({
      insertImageProducts: [...this.state.insertImageProducts, {
        origin: fileResize.origin,
        base64: fileResize.base64,
      }]
    });
  }

  async insertImageProductPreviewClicked(name) {
    const CoreUI = await FACTORY.GET_CORE_UI();
    const ok = await CoreUI.fun_showConfirm({
      title: 'X??a h??nh n??y ?',
      message: 'X??a h??nh m?? t??? n??y ?',
    });
    if (!ok) return;
    this.setState({
      insertImageProducts: this.state.insertImageProducts.filter((v) => {
        return String(v.origin.name) !== String(name);
      }),
    });
  }

  getInsertImageProductPreview() {
    const post = this.props.dataUpdate;
    return this.state.insertImageProducts.map((v, k) => {
      if (v.base64)
        return (
          <span role="link" key={k} onClick={() => this.insertImageProductPreviewClicked(v.origin.name)}>
            <img alt='Images Products' className="img-fluid w-25 m-2" src={v.base64} />
          </span>
        );
      return (
        <span role="link" key={k} onClick={() => this.insertImageProductPreviewClicked(v.origin.name)}>
          <img alt='Images Products' className="img-fluid w-25 m-2"
            src={FACTORY.fun_getImageViewFromServer(v.origin.name, post.imageUploadType)}
          />
        </span>
      );
    });
  }

  getInsertImageProduct() {
    if (!this.state.isSelectedMarket) return;
    return (
      <div className='insert-image-market mt-3'>
        <div className='row'>
          <div className='col-xxl-4 col-xl-4 col-md-4 col-sm-12 col-12 text-center'>
            <p>
              <Input
                onChange={(e) => this.handleInputChange(e)}
                name='tbBuy'
                autoComplete='off'
                className='text-danger form-control' placeholder='Gi?? g???c b???n mua' type='number' />
            </p>
            <p>
              <Input
                value={FACTORY.fun_formatCurrency(this.state.tbBuy)}
                readOnly={true}
                addonBefore={<span className='fw-bold _text-thr'>B</span>}
                addonAfter='VND'
                autoComplete='off'
                className='text-danger' type='text' />
            </p>
          </div>
          <div className='col-xxl-4 col-xl-4 col-md-4 col-sm-12 col-12 text-center'>
            <p>
              <Input
                onChange={(e) => this.handleInputChange(e)}
                name='tbSell'
                autoComplete='off'
                className='text-success form-control' placeholder='Gi?? b???n b??n' type='number' />
            </p>
            <p>
              <Input
                value={FACTORY.fun_formatCurrency(this.state.tbSell)}
                readOnly={true}
                addonBefore={<span className='fw-bold _text-sec'>S</span>}
                addonAfter='VND'
                autoComplete='off'
                type='text' />
            </p>
          </div>
          {/* <div className='col-xxl-4 col-xl-4 col-md-4 col-sm-12 col-12 text-center'>
            <input id="selectImageProduct" onChange={(e) => this.insertImageProductChange(e)} className="form-control d-none" type="file" accept=".jpg, .png, .jpeg" />
            <label className='btn-upload-file' htmlFor='selectImageProduct' role='button'>+ Upload</label>
          </div> */}
        </div>
        {/* <div className='mt-4'>
          {this.getInsertImageProductPreview()}
        </div> */}
      </div>
    );
  }

  accessRuleChange(e) {
    this.setState({
      isAccessRule: e,
      isAccessNotRobot: FACTORY.fun_random1To100(),
    });
  }

  accessNotRobotChange(e) {
    this.setState({
      valueAcessNotRobotByUser: e,
    });
  }

  getAccessNotRobotUI() {
    if (!this.state.isAccessRule) return;
    return (
      <>
        <p className='fw-bold text-uppercase mb-8'>K??o thang tr?????c t???i m???c:
        <span className='_text-sec'>
            &nbsp;[ {this.state.isAccessNotRobot} ]
          </span>
        </p>
        <Slider onChange={(e) => this.accessNotRobotChange(e)} defaultValue={0} />
      </>
    );
  }

  handleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value.trim();
    this.setState({
      [name]: value,
    });
  }

  btnInsertLinkClicked(data) {
    this.setState({
      links: [...this.state.links, data],
    });
  }

  btnDeleteButtonDownloadClicked() {
    this.state.links.pop();
    this.setState({
      links: [...this.state.links],
    });
  }

  getButtonDownloadUI() {
    let list = this.state.links;
    if (!list) return;
    list = list.map((v, k) => {
      return (
        <ButtonDownload
          key={k}
          href={v.link}
          title={v.title}
        />
      );
    });
    if (list.length > 0) {
      list.push(
        <Button onClick={() => this.btnDeleteButtonDownloadClicked()} key='999999999' icon={<DeleteOutlined />} type='primary' danger ghost></Button>
      );
      return list;
    }
  }

  getCkEditor() {
    if (!this.state.isSelectedMarket)
      return (
        <>
          <div className='insert-btn-download mt-3'>
            <ButtonInsertLinkDownload onOk={(data) => this.btnInsertLinkClicked(data)} />
          </div>
          <div className='ckeditor-component'>
            <CkeditorComponent defaultValue={this.getDataContentDefault()} onChange={(data) => this.ckEditorChange(data)} />
          </div>
          <div className='insert-btn-download mt-3'>
            {this.getButtonDownloadUI()}
          </div>
        </>
      );
  }

  getSelectTagsUI() {
    return (
      <div className='p-3 bg-border mb-3'>
        <p className='h5 fw-bold'>G???n th???</p>
        <SelectTagsComponents
          defaultValue={this.state.tagSelected} onChange={(e) => this.selectTagsChange(e)} listTags={this.state.listTags} />
        <div className='text-right mt-2'>
          <ButtonAddNewTagsComponent
            styled={true}
            onRefresh={() => this.loadListTags()}
            isBlackMarket={this.state.isSelectedMarket || false}
          />
        </div>
      </div>
    )
  }

  valueRadioUserPostChange(e) {
    const value = e.target.value;
    this.setState({
      valueRadioUserPost: value,
      isSelectedMarket: value === 0
    }, () => {
      this.loadListCategory();
      this.loadListTags();
    });
  }

  render() {
    if (this.state.isCleanUp) return (<></>);
    const textInsertOrUp = this.state.isUpdate ? 'C???p Nh???t' : '????ng b??i vi???t';
    return (
      <>
        {this.getGl_loading()}
        <div className="row pb-5" style={{ minHeight: '200px' }}>
          <div className="col-xxl-8 col-xl-8 col-md-8 col-sm-12 col-12" style={{ minHeight: '200px' }}>
            <div id='insert-post-col-left' className='p-3 mt-4 bg-border'>
              <div className='insert-title'>
                <input placeholder='?????t ti??u ????? cho b??i vi???t'
                autoComplete='off'
                 defaultValue={this.state.title} onChange={(e) => this.tbTitleChange(e)} type='text' className='form-control w-100 fw-bold' />
              </div>
              {this.getInsertImageProduct()}
              <div className='insert-title mt-3'>
                <TextArea defaultValue={this.state.descriptionSelected} placeholder='Vi???t ??o???n m?? t??? ng???n' className='form-control w-100' name='descriptionSelected' onChange={(e) => this.handleInputChange(e)} rows={3} />
              </div>
              {this.getCkEditor()}
            </div>

            {this.state.isUpdate ?
              <div className='p-3 mt-4 pb-3 bg-border'>
                <QuestionAnserComponent post={this.props.dataUpdate} />
              </div> :
              <></>
            }
          </div>
          <div className="col-xxl-4 col-xl-4 col-md-4 col-sm-12 col-12 mt-4" style={{ minHeight: '200px' }}>
            {!this.state.isUpdate ?
              <div className='p-3 bg-border mb-3'>
                <p className='h5 fw-bold'>B???n ????ng g?? ?</p>
                <Radio.Group onChange={(e) => this.valueRadioUserPostChange(e)} value={this.state.valueRadioUserPost} >
                  <Radio value={1}>B??i vi???t</Radio>
                  <Radio value={0}>B??n s??ch</Radio>
                </Radio.Group>
              </div> : ''}

            <div className='p-3 bg-border mb-3'>
              <p className='h5 fw-bold'>Ch???n th??? lo???i</p>
              <SelectCategoryComponent defaultValue={this.state.cateSelected} onChange={(e) => this.selectCateChange(e)} listCate={this.state.listCate} />
              <div className='text-right mt-2'>
                <ButtonAddNewCategoryComponent
                  onRefresh={() => this.loadListCategory()}
                  isBlackMarket={this.state.isSelectedMarket || false}
                  styled={true} />
              </div>
            </div>

            {this.getSelectTagsUI()}

            <div className='p-3 bg-border mb-3'>
              <p className='h5 fw-bold'>Ch???n h??nh ?????i di???n</p>
              <div className='text-right mt-2'>
                <input onChange={(e) => this.btnChooseBannerClicked(e)} className="form-control" type="file" accept=".jpg, .png, .jpeg" id="formFile" />
                <div className='w-100 text-center mt-2'>
                  <span role="link" onClick={() => this.imgBannerClicked()} >
                    {this.getImageBanner()}
                  </span>
                </div>
              </div>
            </div>

            <div className='p-3 bg-border'>
              {this.userLoged.role === RoleUser.MEM ?
                <>
                  <div className='m-2 p-2 mt-0 pt-0'>
                    <Switch name='isAccessRule' onChange={(e) => this.accessRuleChange(e)} checkedChildren="C??m ??n" unCheckedChildren="T??i!... ?????ng ?? v???i ??i???u kho???n" />
                  </div>
                  <div className='m-2 p-2 mt-0 pt-0'>
                    {this.getAccessNotRobotUI()}
                  </div>
                </> : ''}
              {this.getButtonInserOrUpdate(textInsertOrUp)}
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state, _ownProps) => {
  return {
    adminRouter: state.adminRouter
  }
}

export default connect(mapStateToProps)(InsertNewPostComponent);