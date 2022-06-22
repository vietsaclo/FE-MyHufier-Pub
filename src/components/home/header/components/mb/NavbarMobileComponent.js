import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PicRightOutlined } from '@ant-design/icons';
import ButtonMessagePcComponent from '../pc/ButtonMessagePcComponent';
import BodyMessagePcComponent from '../pc/BodyMessagePcComponent';
import ButtonSwithTheme from '../../../../common/ButtonSwithDarkLightTheme';

// import loadable from '@loadable/component';
// const ButtonMessagePcComponent = loadable(() => import('../pc/ButtonMessagePcComponent'));
// const BodyMessagePcComponent = loadable(() => import('../pc/BodyMessagePcComponent'));
// const ButtonSwithTheme = loadable(() => import('../../../../common/ButtonSwithDarkLightTheme'));

class NavbarMobileComponent extends Component {

  navLinkClicked(value) {
    if (!this.props.navLinkClicked) return;
    this.props.navLinkClicked(value);
  }

  render() {
    return (
      <div className="container__mobile " >
        <ul className="mobile__navbar-list">
          <li className="mobile__navbar-item mobile__navbar-item-7 ">
            <nav className="navbar navbar--S ">
              <div className="container-fluid container-fluid- ">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
                  <PicRightOutlined />
                </button>
              </div>
            </nav>

          </li>
          <li className="mobile__navbar-item-">
            <Link to="/">
              <i className="fas fa-book-reader bi container-fluid-" style={{ fontSize: '30px' }}>&nbsp;</i>
            </Link>
          </li>

          <li className="mobile__navbar-item">
            {/* btn switchtheme */}
            <div className="mobile__navbar-item-R">
              <ul className="mobile__navbar-item-R">
                <li className="mobile__navbar-item-R-li">
                  <span style={{ marginRight: '7px' }}>
                    <ButtonSwithTheme />
                  </span>
                </li>
                <li>{/*
              # Code by thangchay
              # edit by vietsaclo
              This button message -> user logon -> show button ?
            */}
                  {this.props.user && this.props.user.userId ?
                    <ButtonMessagePcComponent
                      user={this.props.user}
                      socket={this.props.socket}
                    /> : ''
                  }
                  {/*
              # Code by thangchay
              # edit by vietsaclo
              This is body button message -> user logon -> show body button ?
            */}
                  {this.props.user && this.props.user.userId ?
                    <BodyMessagePcComponent
                      user={this.props.user}
                      socket={this.props.socket}
                    /> : ''
                  }</li>
              </ul>
            </div>
          </li>
        </ul>
        <div className="collapse" id="navbarToggleExternalContent">
          <div className="bg-header  mobile__menu " id="nav-links">
            <ul className="mobile__menu-list">
              <li className="mobile__menu-item">
                <NavLink
                  onClick={() => this.navLinkClicked('BLACK_MARKET')}
                  to="/black-market"
                  className="nav-link px-2">Nhà sách
                </NavLink>
              </li>
              <li className="mobile__menu-item ">
                <NavLink
                  onClick={() => this.navLinkClicked('USER_POST')}
                  to="/user-post"
                  className="nav-link px-2">Đăng Bài Viết
                </NavLink>
              </li>
              <li className="mobile__menu-item ">
                <NavLink
                  onClick={() => this.navLinkClicked('SUGGESTION')}
                  to="/suggestion"
                  className="nav-link px-2">Hộp Thư Góp Ý
                </NavLink>
              </li>

              <li className="mobile__menu-item ">
                <NavLink
                  onClick={() => this.navLinkClicked('RANK_EXAMP')}
                  to="/exam"
                  className="nav-link px-2">Thi thử
                </NavLink>
              </li>

              <li className="mobile__menu-item ">
                <NavLink
                  onClick={() => this.navLinkClicked('RANK_EXAMP')}
                  to="/rank"
                  className="nav-link px-2">Xếp hạng
                </NavLink>
              </li>

              <li className="mobile__menu-item ">
                <NavLink
                  onClick={() => this.navLinkClicked('DONATE')}
                  to="/donate"
                  className="nav-link px-2">Ủng hộ Admin
                </NavLink>
              </li>
            </ul>
            <ul className="mobile__menu-list-2" >
              <li className="mobile__menu-item-2">
                <div className="text-end">
                  {this.props.getUserAvatar != null ? this.props.getUserAvatar() : ''}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default NavbarMobileComponent;