import { Switch } from 'antd';
import React, { Component } from 'react';
import { LocalStorageKeys } from "../../common/utils/keys";

class ButtonSwithDarkLightTheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTheme: 'light',
      isLoading: true,
    };
    this.keyLocal = localStorage.getItem(LocalStorageKeys.THEME_MODE);
  }

  lightTheme = {
    '--bg-body': '#ffffff',
    '--bg-body-light': '#f7f7f7',
    '--cl-border-light': '#cac9ea',
    '--cl-pr': '#0a077b',
    '--cl-white': '#fff',
    '--cl-dark': '#000',
    '--cl-sec': '#077300',
    '--cl-thr': '#890092',
    '--a-cl': '#a59600',
    '--a-cl-hover': '#188a00',
    '--cl-rank-header': '#f5f5f5'
  };

  darkTheme = {
    '--bg-body': '#1f2128',
    '--bg-body-light': '#242731',
    '--cl-border-light': '#303441',
    '--cl-pr': '#d3cfcf',
    '--cl-white': '#fff',
    '--cl-dark': '#000',
    '--cl-sec': '#e59ef3',
    '--cl-thr': '#56eefd',
    '--a-cl': '#ffec6f',
    '--a-cl-hover': '#e59ef3',
    '--cl-rank-header': '#2f323b'
  };

  applyTheme = (nextTheme) => {
    const theme = nextTheme === "dark" ? this.darkTheme : this.lightTheme;
    return Object.keys(theme).map(key => {
      const value = theme[key];
      document.documentElement.style.setProperty(key, value);
      return key;
    });
  };

  btnSwithThemeClicked() {
    const nextTheme = this.state.currentTheme === "light" ? "dark" : "light";
    this.setState({ currentTheme: nextTheme }, () => {
      localStorage.setItem(LocalStorageKeys.THEME_MODE, nextTheme);
      this.applyTheme(nextTheme);
    });
  }

  componentDidMount() {
    // if (this.state.currentTheme === 'light')
    //   this.btnSwithThemeClicked();

    if (!this.keyLocal) {
      this.setState({ isLoading: false }, () => {
        localStorage.setItem(LocalStorageKeys.THEME_MODE, 'light');
      });
    } else if (this.keyLocal !== this.state.currentTheme) {
      this.setState({ currentTheme: this.keyLocal, isLoading: false }, () => {
        this.applyTheme(this.keyLocal);
      });
    } else {
      this.setState({ isLoading: false });
    }
  }

  render() {
    return !this.state.isLoading ?
      <Switch
        checked={this.state.currentTheme === 'dark'}
        onChange={() => this.btnSwithThemeClicked()}
        unCheckedChildren={
          <i className="fas fa-sun">&nbsp;GRN</i>
        }
        checkedChildren={
          <i className="fas fa-moon">&nbsp;PIK</i>
        } /> :
      '';
  }
}

export default ButtonSwithDarkLightTheme;