import './Settings.css';
import $ from 'jquery';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import UserPreferencesStore from '../../../stores/UserPreferencesStore';
import UserIdentityStore from '../../../stores/UserIdentityStore';
import MessageStore from '../../../stores/MessageStore';
import Cookies from 'universal-cookie';
import Dialog from '@material-ui/core/Dialog';
import CloseButton from '../../shared/CloseButton';
import RemoveDeviceDialog from '../../TableComplex/RemoveDeviceDialog.react';
import Translate from '../../Translate/Translate.react';
import StaticAppBar from '../../StaticAppBar/StaticAppBar.react';
import * as Actions from '../../../actions/';
import React, { Component } from 'react';
import MenuList from '@material-ui/core/MenuList';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import countryData from 'country-data';
import ShareOnSocialMedia from './ShareOnSocialMedia';
import {
  voiceList,
  voiceListChange,
} from './../../../constants/SettingsVoiceConstants.js';
// Icons
import ChatIcon from '@material-ui/icons/Chat';
import ThemeIcon from '@material-ui/icons/InvertColors';
import VoiceIcon from '@material-ui/icons/SettingsVoice';
import ChevronRight from '@material-ui/icons/ChevronRight';
import SpeechIcon from '@material-ui/icons/RecordVoiceOver';
import AccountIcon from '@material-ui/icons/AccountBox';
import LockIcon from '@material-ui/icons/Lock';
import MyDevices from '@material-ui/icons/Devices';
import MobileIcon from '@material-ui/icons/PhoneAndroid';
import ShareIcon from '@material-ui/icons/Share';
import {
  isProduction,
  sortCountryLexographical,
} from '../../../utils/helperFunctions';
import urls from '../../../utils/urls';
import { isPhoneNumber } from '../../../utils';

import MicrophoneTab from './MicrophoneTab.react';
import ThemeChangeTab from './ThemeChangeTab.react';
import SpeechTab from './SpeechTab.react';
import AccountTab from './AccountTab.react';
import PasswordTab from './PasswordTab.react';
import DevicesTab from './DevicesTab.react';
import MobileTab from './MobileTab.react';
import ChatAppTab from './ChatAppTab.react';

import {
  addUserDevice,
  removeUserDevice,
  getUserSettings,
} from '../../../apis/index';

const cookieDomain = isProduction() ? '.susi.ai' : '';

const cookies = new Cookies();

let defaults = UserPreferencesStore.getPreferences();

const menuObj = [
  { name: 'Account', icon: <AccountIcon /> },
  { name: 'Password', icon: <LockIcon /> },
  { name: 'Mobile', icon: <MobileIcon /> },
  { name: 'ChatApp', icon: <ChatIcon /> },
  { name: 'Theme', icon: <ThemeIcon /> },
  { name: 'Microphone', icon: <VoiceIcon /> },
  { name: 'Speech', icon: <SpeechIcon /> },
  { name: 'Devices', icon: <MyDevices /> },
  { name: 'Share on social media', icon: <ShareIcon /> },
];

class Settings extends Component {
  constructor(props) {
    super(props);
    defaults = UserPreferencesStore.getPreferences();
    let identity = UserIdentityStore.getIdentity();
    let defaultServer = defaults.Server;
    let defaultTheme = UserPreferencesStore.getTheme(this.preview);
    let defaultEnterAsSend = defaults.EnterAsSend;
    let defaultMicInput = defaults.MicInput;
    let defaultSpeechOutput = defaults.SpeechOutput;
    let defaultSpeechOutputAlways = defaults.SpeechOutputAlways;
    let defaultSpeechRate = defaults.SpeechRate;
    let defaultSpeechPitch = defaults.SpeechPitch;
    let defaultTTSLanguage = defaults.TTSLanguage;
    let defaultUserName = defaults.UserName;
    let defaultPrefLanguage = defaults.PrefLanguage;
    let defaultTimeZone = defaults.TimeZone;
    let defaultChecked = defaults.checked;
    let defaultServerUrl = defaults.serverUrl;
    let defaultCountryCode = defaults.CountryCode;
    let defaultCountryDialCode = defaults.CountryDialCode;
    let defaultPhoneNo = defaults.PhoneNo;
    let TTSBrowserSupport;
    if ('speechSynthesis' in window) {
      TTSBrowserSupport = true;
    } else {
      TTSBrowserSupport = false;
      console.warn(
        'The current browser does not support the SpeechSynthesis API.',
      );
    }
    this.customServerMessage = '';
    this.TTSBrowserSupport = TTSBrowserSupport;
    this.state = {
      dataFetched: false,
      deviceData: false,
      obj: [],
      mapObj: [],
      devicenames: [],
      rooms: [],
      macids: [],
      editIdx: -1,
      removeDevice: -1,
      slideIndex: 0,
      centerLat: 0,
      centerLng: 0,
      identity,
      theme: defaultTheme,
      enterAsSend: defaultEnterAsSend,
      micInput: defaultMicInput,
      speechOutput: defaultSpeechOutput,
      speechOutputAlways: defaultSpeechOutputAlways,
      server: defaultServer,
      serverUrl: defaultServerUrl,
      serverFieldError: false,
      checked: defaultChecked,
      validForm: true,
      speechRate: defaultSpeechRate,
      speechPitch: defaultSpeechPitch,
      ttsLanguage: defaultTTSLanguage,
      userName: defaultUserName,
      PrefLanguage: defaultPrefLanguage,
      TimeZone: defaultTimeZone,
      showOptions: false,
      showRemoveConfirmation: false,
      anchorEl: null,
      countryCode: defaultCountryCode,
      countryDialCode: defaultCountryDialCode,
      PhoneNo: defaultPhoneNo,
      voiceList: voiceList,
      intialSettings: {
        theme: defaultTheme,
        enterAsSend: defaultEnterAsSend,
        micInput: defaultMicInput,
        speechOutput: defaultSpeechOutput,
        speechOutputAlways: defaultSpeechOutputAlways,
        speechRate: defaultSpeechRate,
        speechPitch: defaultSpeechPitch,
        ttsLanguage: defaultTTSLanguage,
        server: defaultServer,
        userName: defaultUserName,
        PrefLanguage: defaultPrefLanguage,
        TimeZone: defaultTimeZone,
        serverUrl: defaultServerUrl,
        checked: defaultChecked,
        countryCode: defaultCountryCode,
        countryDialCode: defaultCountryDialCode,
        PhoneNo: defaultPhoneNo,
      },
    };
  }

  // handleRemove() function handles deletion of devices
  handleRemove = i => {
    let data = this.state.obj;
    let macid = data[i].macid;

    // Remove the row whose index does not matches the index passed in parameter
    this.setState({
      obj: data.filter((row, j) => j !== i),
    });

    // Make API call to the endpoint to delete the device on the server side
    removeUserDevice({ macid })
      .then(payload => {})
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        location.reload();
      });
  };

  // startEditing() function handles editing of rows
  // editIdx is set to the row index which is currently being edited
  startEditing = i => {
    this.setState({ editIdx: i });
  };

  // stopEditing() function handles saving of the changed device config
  stopEditing = i => {
    let data = this.state.obj;
    let macid = data[i].macid;
    let devicename = data[i].devicename;
    let room = data[i].room;
    let latitude = data[i].latitude;
    let longitude = data[i].longitude;
    let devicenames = this.state.devicenames;
    devicenames[i] = devicename;
    let rooms = this.state.rooms;
    rooms[i] = room;

    // Set the value of editIdx to -1 to denote that no row is currently being edited
    // Set values for devicenames and rooms to pass as props for the Map View component
    this.setState({
      editIdx: -1,
      devicenames: devicenames,
      rooms: rooms,
    });

    // Make API call to the endpoint for adding new devices
    // to overwrite the updated config of devices on the existing config on the server

    addUserDevice({ macid, devicename, room, latitude, longitude })
      .then(payload => {})
      .catch(error => {
        console.log(error);
      });
  };

  // handleChange() function handles changing of textfield values on keypresses
  handleChange = (e, name, i) => {
    const value = e.target.value;
    let data = this.state.obj;
    this.setState({
      obj: data.map((row, j) => (j === i ? { ...row, [name]: value } : row)),
    });
  };

  handleTabSlide = value => {
    this.setState({
      slideIndex: value,
    });
  };

  // apiCall() function fetches user settings and devices from the server
  apiCall = () => {
    getUserSettings()
      .then(payload => {
        const { devices } = payload;
        let obj = [];
        let mapObj = [];
        let devicenames = [];
        let rooms = [];
        let macids = [];
        let centerLat = 0;
        let centerLng = 0;
        if (devices) {
          let keys = Object.keys(devices);
          let devicesNotAvailable = 0;

          // Extract device info and store them in an object, namely myObj
          keys.forEach(i => {
            const { name, room, geolocation } = devices[i];
            const { latitude, longitude } = geolocation;
            let myObj = {
              macid: i,
              devicename: name,
              room,
              latitude,
              longitude,
            };

            // Store location info of the device for the Map View
            let locationData = {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            };
            if (
              myObj.latitude === 'Latitude not available.' ||
              myObj.longitude === 'Longitude not available.'
            ) {
              devicesNotAvailable++;
            } else {
              centerLat += parseFloat(latitude);
              centerLng += parseFloat(longitude);
            }

            let location = {
              location: locationData,
            };
            obj.push(myObj);
            mapObj.push(location);
            devicenames.push(name);
            rooms.push(room);
            macids.push(i);
            this.setState({
              dataFetched: true,
            });
          });

          // Find average latitude and longitude to be used as initial center of map
          centerLat /= mapObj.length - devicesNotAvailable;
          centerLng /= mapObj.length - devicesNotAvailable;
          if (obj.length) {
            this.setState({
              deviceData: true,
              obj: obj,
            });
          }
          if (mapObj.length) {
            this.setState({
              mapObj,
              centerLat,
              centerLng,
              devicesNotAvailable,
            });
          }
          if (devicenames.length) {
            this.setState({
              devicenames,
            });
          }
          if (rooms.length) {
            this.setState({
              rooms,
            });
          }
          if (macids.length) {
            this.setState({
              macids,
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Boolean to store the state of preview i.e which theme to display
  preview = false;
  // save a variable in state holding the initial state of the settings
  setInitialSettings = () => {
    defaults = UserPreferencesStore.getPreferences();
    let identity = UserIdentityStore.getIdentity();
    let defaultServer = defaults.Server;
    let defaultTheme = UserPreferencesStore.getTheme(this.preview);
    let defaultEnterAsSend = defaults.EnterAsSend;
    let defaultMicInput = defaults.MicInput;
    let defaultSpeechOutput = defaults.SpeechOutput;
    let defaultSpeechOutputAlways = defaults.SpeechOutputAlways;
    let defaultSpeechRate = defaults.SpeechRate;
    let defaultSpeechPitch = defaults.SpeechPitch;
    let defaultTTSLanguage = defaults.TTSLanguage;
    let defaultUserName = defaults.UserName;
    let defaultPrefLanguage = defaults.PrefLanguage;
    let defaultTimeZone = defaults.TimeZone;
    let defaultChecked = defaults.checked;
    let defaultServerUrl = defaults.serverUrl;
    let defaultCountryCode = defaults.CountryCode;
    let defaultCountryDialCode = defaults.CountryDialCode;
    let defaultPhoneNo = defaults.PhoneNo;
    this.setState({
      identity,
      intialSettings: {
        theme: defaultTheme,
        enterAsSend: defaultEnterAsSend,
        micInput: defaultMicInput,
        speechOutput: defaultSpeechOutput,
        speechOutputAlways: defaultSpeechOutputAlways,
        speechRate: defaultSpeechRate,
        speechPitch: defaultSpeechPitch,
        ttsLanguage: defaultTTSLanguage,
        server: defaultServer,
        userName: defaultUserName,
        PrefLanguage: defaultPrefLanguage,
        TimeZone: defaultTimeZone,
        serverUrl: defaultServerUrl,
        checked: defaultChecked,
        countryCode: defaultCountryCode,
        countryDialCode: defaultCountryDialCode,
        PhoneNo: defaultPhoneNo,
      },
    });
  };
  // extract values from store to get the initial settings
  setDefaultsSettings = () => {
    defaults = UserPreferencesStore.getPreferences();
    let defaultServer = defaults.Server;
    let defaultTheme = UserPreferencesStore.getTheme(this.preview);
    let defaultEnterAsSend = defaults.EnterAsSend;
    let defaultMicInput = defaults.MicInput;
    let defaultSpeechOutput = defaults.SpeechOutput;
    let defaultSpeechOutputAlways = defaults.SpeechOutputAlways;
    let defaultSpeechRate = defaults.SpeechRate;
    let defaultSpeechPitch = defaults.SpeechPitch;
    let defaultTTSLanguage = defaults.TTSLanguage;
    let defaultUserName = defaults.UserName;
    let defaultPrefLanguage = defaults.PrefLanguage;
    let defaultTimeZone = defaults.TimeZone;
    let defaultChecked = defaults.checked;
    let defaultServerUrl = defaults.serverUrl;
    let defaultCountryCode = defaults.CountryCode;
    let defaultCountryDialCode = defaults.CountryDialCode;
    let defaultPhoneNo = defaults.PhoneNo;
    this.setState({
      theme: defaultTheme,
      enterAsSend: defaultEnterAsSend,
      micInput: defaultMicInput,
      speechOutput: defaultSpeechOutput,
      speechOutputAlways: defaultSpeechOutputAlways,
      server: defaultServer,
      serverUrl: defaultServerUrl,
      serverFieldError: false,
      checked: defaultChecked,
      validForm: true,
      speechRate: defaultSpeechRate,
      speechPitch: defaultSpeechPitch,
      ttsLanguage: defaultTTSLanguage,
      userName: defaultUserName,
      PrefLanguage: defaultPrefLanguage,
      TimeZone: defaultTimeZone,
      showOptions: false,
      showRemoveConfirmation: false,
      anchorEl: null,
      slideIndex: 0,
      countryCode: defaultCountryCode,
      countryDialCode: defaultCountryDialCode,
      PhoneNo: defaultPhoneNo,
    });
  };

  /**
   * Event handler for 'change' events coming from the UserPreferencesStore
   */
  _onChangeSettings = () => {
    this.setInitialSettings();
    this.setDefaultsSettings();
  };

  // Close all open dialogs
  handleClose = () => {
    this.setState({
      showOptions: false,
      showRemoveConfirmation: false,
    });
  };

  handleThemeChanger = () => {
    switch (this.state.currTheme) {
      case 'light': {
        this.applyLightTheme();
        break;
      }
      case 'dark': {
        this.applyDarkTheme();
        break;
      }
      default: {
        let prevThemeSettings = {};
        let state = this.state;
        prevThemeSettings.currTheme = state.currTheme;
        prevThemeSettings.bodyColor = state.body;
        prevThemeSettings.TopBarColor = state.header;
        prevThemeSettings.composerColor = state.composer;
        prevThemeSettings.messagePane = state.pane;
        prevThemeSettings.textArea = state.textarea;
        prevThemeSettings.buttonColor = state.button;
        prevThemeSettings.bodyBackgroundImage = state.bodyBackgroundImage;
        prevThemeSettings.messageBackgroundImage = state.messageBackgroundImage;
        this.setState({ prevThemeSettings });
      }
    }
  };

  applyLightTheme = () => {
    this.setState({
      prevThemeSettings: null,
      body: '#fff',
      header: '#4285f4',
      composer: '#f3f2f4',
      pane: '#f3f2f4',
      textarea: '#fff',
      button: '#4285f4',
      currTheme: 'light',
    });
    let customData = '';
    Object.keys(this.customTheme).forEach(key => {
      customData = customData + this.customTheme[key] + ',';
    });

    let settingsChanged = {};
    settingsChanged.theme = 'light';
    settingsChanged.customThemeValue = customData;
    if (this.state.bodyBackgroundImage || this.state.messageBackgroundImage) {
      settingsChanged.backgroundImage =
        this.state.bodyBackgroundImage +
        ',' +
        this.state.messageBackgroundImage;
    }
    Actions.settingsChanged(settingsChanged);
  };

  applyDarkTheme = () => {
    this.setState({
      prevThemeSettings: null,
      body: '#fff',
      header: '#4285f4',
      composer: '#f3f2f4',
      pane: '#f3f2f4',
      textarea: '#fff',
      button: '#4285f4',
      currTheme: 'dark',
    });
    let customData = '';
    Object.keys(this.customTheme).forEach(key => {
      customData = customData + this.customTheme[key] + ',';
    });

    let settingsChanged = {};
    settingsChanged.theme = 'dark';
    settingsChanged.customThemeValue = customData;
    if (this.state.bodyBackgroundImage || this.state.messageBackgroundImage) {
      settingsChanged.backgroundImage =
        this.state.bodyBackgroundImage +
        ',' +
        this.state.messageBackgroundImage;
    }
    Actions.settingsChanged(settingsChanged);
  };

  // Submit selected Settings
  handleSubmit = () => {
    let newDefaultServer = this.state.server;
    let newEnterAsSend = this.state.enterAsSend;
    let newMicInput = this.state.micInput;
    let newSpeechOutput = this.state.speechOutput;
    let newSpeechOutputAlways = this.state.speechOutputAlways;
    let newSpeechRate = this.state.speechRate;
    let newSpeechPitch = this.state.speechPitch;
    let newTTSLanguage = this.state.ttsLanguage;
    let newUserName = this.state.userName;
    let newPrefLanguage = this.state.PrefLanguage;
    let newTimeZone = this.state.TimeZone;
    let checked = this.state.checked;
    let serverUrl = this.state.serverUrl;
    let newCountryCode = !this.state.countryCode
      ? this.state.intialSettings.countryCode
      : this.state.countryCode;
    let newCountryDialCode = !this.state.countryDialCode
      ? this.state.intialSettings.countryDialCode
      : this.state.countryDialCode;
    let newPhoneNo = this.state.PhoneNo;
    if (newDefaultServer.slice(-1) === '/') {
      newDefaultServer = newDefaultServer.slice(0, -1);
    }
    let vals = {
      server: newDefaultServer,
      enterAsSend: newEnterAsSend,
      micInput: newMicInput,
      speechOutput: newSpeechOutput,
      speechOutputAlways: newSpeechOutputAlways,
      speechRate: newSpeechRate,
      speechPitch: newSpeechPitch,
      ttsLanguage: newTTSLanguage,
      userName: newUserName,
      prefLanguage: newPrefLanguage,
      timeZone: newTimeZone,
      countryCode: newCountryCode,
      countryDialCode: newCountryDialCode,
      phoneNo: newPhoneNo,
      checked,
      serverUrl,
    };
    // if preview, save current theme state to previewTheme
    if (this.preview) {
      vals.theme = UserPreferencesStore.getTheme(!this.preview);
      vals.previewTheme = this.state.theme;
    }
    // else save current theme state to theme
    else {
      vals.theme = this.state.theme;
      vals.previewTheme = UserPreferencesStore.getTheme(this.preview);
    }
    let settings = Object.assign({}, vals);
    settings.LocalStorage = true;
    // Store in cookies for anonymous user
    cookies.set('settings', settings);
    console.log('settings saved', settings);
    this.setInitialSettings();
    // Trigger Actions to save the settings in stores and server
    this.implementSettings(vals);
    let userName = vals.userName;
    cookies.set('username', userName, {
      path: '/',
      domain: cookieDomain,
    });
  };

  // Store the settings in stores and server
  implementSettings = values => {
    let currSettings = UserPreferencesStore.getPreferences();
    let resetVoice = false;
    if (currSettings.SpeechOutput !== values.speechOutput) {
      resetVoice = true;
    }
    if (currSettings.SpeechOutputAlways !== values.speechOutputAlways) {
      resetVoice = true;
    }
    Actions.settingsChanged(values);
    if (resetVoice) {
      Actions.resetVoice();
    }
    this.props.history.push(`/settings?tab=${this.state.selectedSetting}`);
  };

  // Handle change to theme settings
  handleSelectChange = (event, value) => {
    value === 'light' || value === 'custom'
      ? $('#settings-container').addClass('settings-container-light')
      : $('#settings-container').addClass('settings-container-dark');
    this.preview = true;
    this.setState({ theme: value }, () => {
      this.handleSubmit();
      this.preview = false;
    });
  };

  // Handle change to enter as send settings
  handleEnterAsSend = (event, isInputChecked) => {
    this.setState({
      enterAsSend: isInputChecked,
    });
  };

  // Handle change to mic input settings
  handleMicInput = (event, isInputChecked) => {
    this.setState({
      micInput: isInputChecked,
    });
  };

  // Handle change to speech output on speech input settings
  handleSpeechOutput = (event, isInputChecked) => {
    this.setState({
      speechOutput: isInputChecked,
    });
  };

  // Handle change to speech output always settings
  handleSpeechOutputAlways = (event, isInputChecked) => {
    this.setState({
      speechOutputAlways: isInputChecked,
    });
  };

  // save new TTS settings
  handleNewTextToSpeech = settings => {
    this.setState({
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
      ttsLanguage: settings.ttsLanguage,
    });
  };

  // Handle toggle between default server and custom server
  handleServeChange = event => {
    let state = this.state;
    let serverUrl;
    if (event.target.value === 'customServer') {
      state.checked = !state.checked;
      defaults = UserPreferencesStore.getPreferences();
      state.serverUrl = defaults.StandardServer;
      state.serverFieldError = false;
    } else if (event.target.name === 'serverUrl') {
      serverUrl = event.target.value;
      //eslint-disable-next-line
      let validServerUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:~+#-]*[\w@?^=%&amp;~+#-])?/i.test(
        serverUrl,
      );
      state.serverUrl = serverUrl;
      state.serverFieldError = !(serverUrl && validServerUrl);
    }
    this.setState(state);

    if (this.state.serverFieldError) {
      this.customServerMessage = 'Enter a valid URL';
    } else {
      this.customServerMessage = '';
    }

    if (this.state.serverFieldError && this.state.checked) {
      this.setState({ validForm: false });
    } else {
      this.setState({ validForm: true });
    }
  };

  // Close settings and redirect to landing page
  onRequestClose = () => {
    this.props.history.push('/');
    window.location.reload();
  };

  // Open Remove Device Confirmation dialog
  handleRemoveConfirmation = i => {
    let data = this.state.obj;
    let devicename = data[i].devicename;
    this.setState({
      showRemoveConfirmation: true,
      showOptions: false,
      removeDevice: i,
      removeDeviceName: devicename,
    });
  };

  // Show Top Bar drop down menu
  showOptions = event => {
    this.setState({
      showOptions: true,
      anchorEl: event.currentTarget,
    });
  };

  handlePrefLang = event => {
    this.setState({
      PrefLanguage: event.target.value,
    });
  };

  handleTimeZone = value => {
    this.setState({
      TimeZone: value,
    });
  };

  // Close Top Bar drop down menu
  closeOptions = () => {
    this.setState({
      showOptions: false,
    });
  };

  componentWillUnmount() {
    MessageStore.removeChangeListener(this._onChange);
    UserPreferencesStore.removeChangeListener(this._onChangeSettings);
  }

  // Populate language list
  _onChange = () => {
    this.setState({
      voiceList: voiceListChange,
    });
  };

  // eslint-disable-next-line
  componentDidMount() {
    document.body.className = 'white-body';
    if (!this.state.dataFetched && cookies.get('loggedIn')) {
      this.apiCall();
    }
    document.title =
      'Settings - SUSI.AI - Open Source Artificial Intelligence for Personal Assistants, Robots, Help Desks and Chatbots';
    MessageStore.addChangeListener(this._onChange);
    UserPreferencesStore.addChangeListener(this._onChangeSettings);
    this.setState({
      search: false,
    });

    this.showWhenLoggedIn = 'none';
    let searchParams = new URLSearchParams(window.location.search);
    let tab = searchParams.get('tab');
    if (tab) {
      this.setState({
        selectedSetting: tab,
      });
    } else {
      this.setState({
        selectedSetting: cookies.get('loggedIn') ? 'Account' : 'ChatApp',
      });
    }
    this.showWhenLoggedIn = 'none';
  }

  // Generate language list drop down menu items
  populateVoiceList = () => {
    let voices = this.state.voiceList;
    let langCodes = [];
    let voiceMenu = voices.map((voice, index) => {
      langCodes.push(voice.lang);
      return (
        <MenuItem value={voice.lang} key={index}>
          {voice.name + ' (' + voice.lang + ')'}
        </MenuItem>
      );
    });
    let currLang = this.state.PrefLanguage;
    let voiceOutput = {
      voiceMenu: voiceMenu,
      voiceLang: currLang,
    };
    // `-` and `_` replacement check of lang codes
    if (langCodes.indexOf(currLang) === -1) {
      if (
        currLang.indexOf('-') > -1 &&
        langCodes.indexOf(currLang.replace('-', '_')) > -1
      ) {
        voiceOutput.voiceLang = currLang.replace('-', '_');
      } else if (
        currLang.indexOf('_') > -1 &&
        langCodes.indexOf(currLang.replace('_', '-')) > -1
      ) {
        voiceOutput.voiceLang = currLang.replace('_', '-');
      }
    }
    return voiceOutput;
  };

  loadSettings = (e, value) => {
    this.setDefaultsSettings(); // on every tab change, load the default settings
    this.setState({
      selectedSetting: e.target.innerText || e.target.value,
    });
    //  Revert to original theme if user navigates away without saving.
    if (this.state.theme !== UserPreferencesStore.getTheme()) {
      this.setState({ theme: UserPreferencesStore.getTheme() }, () => {
        this.handleSubmit();
      });
    }
  };

  displaySaveChangesButton = () => {
    let selectedSetting = this.state.selectedSetting;
    if (selectedSetting === 'Password') {
      return false;
    }
    if (selectedSetting === 'Devices') {
      return false;
    }
    if (selectedSetting === 'Share on Social media') {
      return false;
    }
    return true; // display the button otherwise
  };

  getSomethingToSave = () => {
    let somethingToSave = false;
    const intialSettings = this.state.intialSettings;
    const classState = this.state;
    if (UserPreferencesStore.getTheme() !== this.state.theme) {
      somethingToSave = true;
    } else if (intialSettings.enterAsSend !== classState.enterAsSend) {
      somethingToSave = true;
    } else if (intialSettings.micInput !== classState.micInput) {
      somethingToSave = true;
    } else if (intialSettings.speechOutput !== classState.speechOutput) {
      somethingToSave = true;
    } else if (
      intialSettings.speechOutputAlways !== classState.speechOutputAlways
    ) {
      somethingToSave = true;
    } else if (intialSettings.speechRate !== classState.speechRate) {
      somethingToSave = true;
    } else if (intialSettings.speechPitch !== classState.speechPitch) {
      somethingToSave = true;
    } else if (intialSettings.ttsLanguage !== classState.ttsLanguage) {
      somethingToSave = true;
    } else if (intialSettings.server !== classState.server) {
      somethingToSave = true;
    } else if (intialSettings.checked !== classState.checked) {
      somethingToSave = true;
    } else if (intialSettings.UserName !== classState.userName) {
      somethingToSave = true;
    } else if (intialSettings.PrefLanguage !== classState.PrefLanguage) {
      somethingToSave = true;
    } else if (intialSettings.TimeZone !== classState.TimeZone) {
      somethingToSave = true;
    } else if (intialSettings.countryCode !== classState.countryCode) {
      somethingToSave = true;
    } else if (intialSettings.serverUrl !== classState.serverUrl) {
      somethingToSave = true;
    } else if (intialSettings.PhoneNo !== classState.PhoneNo) {
      somethingToSave = true;
    } else if (intialSettings.PrefLanguage !== classState.PrefLanguage) {
      somethingToSave = true;
    }
    return somethingToSave;
  };

  handleCountryChange = (event, index) => {
    const { value } = event.target;
    this.setState({
      countryCode: value,
      countryDialCode:
        countryData.countries[value ? value : 'US'].countryCallingCodes[0],
    });
  };

  handleTelephoneNoChange = event => {
    const { value } = event.target;
    const re = /^\d*$/;
    if (value === '' || re.test(value)) {
      this.setState({ PhoneNo: value });
    }
    if (!isPhoneNumber(value)) {
      this.setState({ phoneNoError: 'Invalid phone number' });
    } else {
      this.setState({ phoneNoError: '' });
    }
  };

  handleUserName = (event, value) => {
    const re = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
    this.setState({ userName: value });
    if (value !== '' && !re.test(value)) {
      this.setState({ userNameError: 'Invalid User Name' });
    } else {
      this.setState({ userNameError: '' });
    }
  };

  generateMenu = () => {
    return menuObj.map(obj => {
      return (
        <React.Fragment>
          <MenuItem
            onClick={this.loadSettings}
            style={{
              color:
                this.state.intialSettings.theme === 'dark' ? '#fff' : '#272727',
            }}
            selected={this.state.selectedSetting === obj.name}
          >
            <ListItemIcon>{obj.icon}</ListItemIcon>
            <ListItemText>{obj.name}</ListItemText>
            <ListItemIcon>
              <ChevronRight />
            </ListItemIcon>
          </MenuItem>

          <hr
            className={
              UserPreferencesStore.getTheme() === 'light'
                ? 'break-line-light'
                : 'break-line-dark'
            }
          />
        </React.Fragment>
      );
    });
  };

  generateDropDownMenu = () => {
    return menuObj.map(obj => {
      return (
        <MenuItem key={obj.name} value={obj.name} className="setting-item">
          {obj.name}
        </MenuItem>
      );
    });
  };

  render() {
    document.body.style.setProperty('background-image', 'none');

    const themeBackgroundColor =
      this.state.intialSettings.theme === 'dark' ? '#19324c' : '#fff';
    const themeForegroundColor =
      this.state.intialSettings.theme === 'dark' ? '#fff' : '#272727';

    const floatingLabelStyle = {
      color: '#9e9e9e',
    };
    const underlineStyle = {
      color: this.state.intialSettings.theme === 'dark' ? '#9E9E9E' : null,
      borderColor:
        this.state.intialSettings.theme === 'dark' ? '#9E9E9E' : null,
    };
    sortCountryLexographical(countryData);
    let countries = countryData.countries.all.map((country, i) => {
      if (countryData.countries.all[i].countryCallingCodes[0]) {
        return (
          <MenuItem value={countryData.countries.all[i].alpha2} key={i}>
            {countryData.countries.all[i].name +
              ' ' +
              countryData.countries.all[i].countryCallingCodes[0]}
          </MenuItem>
        );
      }
      return null;
    });

    const radioIconStyle = {
      fill: '#4285f4',
    };

    const inputStyle = {
      height: '35px',
      marginBottom: '10px',
      color: UserPreferencesStore.getTheme() === 'dark' ? 'white' : 'black',
    };

    const headingStyle = {
      marginTop: '1rem',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
    };

    let currentSetting = '';

    const { selectedSetting } = this.state;

    let voiceOutput = this.populateVoiceList();
    switch (selectedSetting) {
      case 'Microphone': {
        currentSetting = (
          <MicrophoneTab
            themeForegroundColor={themeForegroundColor}
            themeVal={UserPreferencesStore.getTheme()}
            handleMicInput={this.handleMicInput}
            micInput={this.state.micInput}
          />
        );
        break;
      }
      case 'Share on Social media': {
        currentSetting = <ShareOnSocialMedia headingStyle={headingStyle} />;
        break;
      }
      case 'Theme': {
        currentSetting = (
          <ThemeChangeTab
            themeForegroundColor={themeForegroundColor}
            radioIconStyle={radioIconStyle}
            themeVal={UserPreferencesStore.getTheme()}
            theme={this.state.theme}
            handleSelectChange={this.handleSelectChange}
            isLoggedIn={cookies.get('loggedIn')}
            handleThemeChanger={this.handleThemeChanger}
          />
        );
        break;
      }
      case 'Speech': {
        currentSetting = (
          <SpeechTab
            headingStyle={headingStyle}
            themeForegroundColor={themeForegroundColor}
            themeVal={UserPreferencesStore.getTheme()}
            handleSpeechOutputAlways={this.handleSpeechOutputAlways}
            speechOutputAlways={this.state.speechOutputAlways}
            speechRate={this.state.speechRate}
            speechPitch={this.state.speechPitch}
            ttsLanguage={this.state.ttsLanguage}
            handleNewTextToSpeech={this.handleNewTextToSpeech}
            handleSpeechOutput={this.handleSpeechOutput}
            speechOutput={this.state.speechOutput}
          />
        );
        break;
      }
      case 'Account': {
        currentSetting = (
          <AccountTab
            themeForegroundColor={themeForegroundColor}
            inputStyle={inputStyle}
            headingStyle={headingStyle}
            themeBackgroundColor={themeBackgroundColor}
            themeVal={UserPreferencesStore.getTheme()}
            userName={this.state.userName}
            handleUserName={this.handleUserName}
            userNameError={this.state.userNameError}
            identityName={this.state.identity.name}
            timeZone={this.state.TimeZone}
            handlePrefLang={this.handlePrefLang}
            handleTimeZone={this.handleTimeZone}
            voiceOutput={voiceOutput}
          />
        );
        break;
      }
      case 'Password': {
        currentSetting = (
          <PasswordTab
            intialSettings={this.state.intialSettings}
            themeVal={UserPreferencesStore.getTheme()}
            {...this.props}
          />
        );
        break;
      }
      case 'Devices': {
        currentSetting = (
          <DevicesTab
            themeVal={UserPreferencesStore.getTheme()}
            deviceData={this.state.deviceData}
            handleRemove={this.handleRemove}
            handleRemoveConfirmation={this.handleRemoveConfirmation}
            startEditing={this.startEditing}
            editIdx={this.state.editIdx}
            stopEditing={this.stopEditing}
            handleChange={this.handleChange}
            tableData={this.state.obj}
            mapObj={this.state.mapObj}
            mapKey={this.props.mapKey}
            centerLat={this.state.centerLat}
            centerLng={this.state.centerLng}
            deviceNames={this.state.devicenames}
            rooms={this.state.rooms}
            macIds={this.state.macids}
            slideIndex={this.state.slideIndex}
            devicesNotAvailable={this.state.devicesNotAvailable}
          />
        );
        break;
      }
      case 'Mobile': {
        currentSetting = (
          <MobileTab
            floatingLabelStyle={floatingLabelStyle}
            headingStyle={headingStyle}
            themeBackgroundColor={themeBackgroundColor}
            themeForegroundColor={themeForegroundColor}
            underlineStyle={underlineStyle}
            themeVal={UserPreferencesStore.getTheme()}
            phoneNo={this.state.PhoneNo}
            phoneNoError={this.state.phoneNoError}
            countryCode={this.state.countryCode}
            countries={countries}
            countryData={countryData.countries}
            handleCountryChange={this.handleCountryChange}
            handleTelephoneNoChange={this.handleTelephoneNoChange}
          />
        );
        break;
      }
      default: {
        currentSetting = (
          <ChatAppTab
            themeVal={UserPreferencesStore.getTheme()}
            themeForegroundColor={themeForegroundColor}
            enterAsSend={this.state.enterAsSend}
            handleEnterAsSend={this.handleEnterAsSend}
          />
        );
      }
    }

    let menuItems = (
      <React.Fragment>
        <div className="settings-list">
          <MenuList>{this.generateMenu()}</MenuList>
        </div>
        <div className="settings-list-dropdown">
          <Select
            onChange={this.loadSettings}
            value={selectedSetting}
            style={{ width: '100%' }}
            autoWidth={false}
          >
            {this.generateDropDownMenu()}
          </Select>
        </div>
      </React.Fragment>
    );

    let menuStyle = {
      marginTop: 20,
      textAlign: 'center',
      display: 'inline-block',
      backgroundColor: themeBackgroundColor,
      color: themeForegroundColor,
    };

    // to check if something has been modified or not
    let somethingToSave = this.getSomethingToSave();
    return (
      <div
        id="settings-container"
        className={
          (UserPreferencesStore.getTheme() === 'light' &&
            this.state.selectedSetting !== 'Theme') ||
          (this.state.selectedSetting === 'Theme' &&
            this.state.theme === 'light')
            ? 'settings-container-light'
            : 'settings-container-dark'
        }
      >
        <Dialog
          modal={false}
          maxWidth={'sm'}
          fullWidth={true}
          open={this.state.showRemoveConfirmation}
          onClose={this.handleClose}
        >
          <RemoveDeviceDialog
            {...this.props}
            deviceIndex={this.state.removeDevice}
            devicename={this.state.removeDeviceName}
            handleRemove={this.handleRemove}
          />
          <CloseButton onClick={this.handleClose} />
        </Dialog>
        <StaticAppBar
          settings={this.state.intialSettings}
          {...this.props}
          location={this.props.location}
        />
        <div className="settingMenu">
          <Paper
            className="leftMenu tabStyle"
            style={{
              backgroundColor: themeBackgroundColor,
              color: themeForegroundColor,
            }}
          >
            {menuItems}
          </Paper>
          <Paper className="rightMenu" style={menuStyle}>
            {currentSetting}
            <div className="settingsSubmit">
              {this.displaySaveChangesButton() && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleSubmit}
                  disabled={
                    !this.state.validForm ||
                    !somethingToSave ||
                    this.state.phoneNoError ||
                    this.state.userNameError
                  }
                >
                  <Translate text="Save Changes" />
                </Button>
              )}
              {selectedSetting !== 'Account' ? (
                ''
              ) : (
                <div style={{ marginRight: '20px' }}>
                  {UserPreferencesStore.getTheme() === 'light' ? (
                    <hr
                      className="break-line-light"
                      style={{ height: '2px', marginTop: '25px' }}
                    />
                  ) : (
                    <hr
                      className="break-line-dark"
                      style={{ height: '2px', marginTop: '25px' }}
                    />
                  )}

                  <p style={{ textAlign: 'center' }}>
                    <span className="Link">
                      <a href={`${urls.ACCOUNT_URL}/delete-account`}>
                        Delete your account
                      </a>
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Paper>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  history: PropTypes.object,
  onSettingsSubmit: PropTypes.func,
  onServerChange: PropTypes.func,
  location: PropTypes.object,
  google: PropTypes.object,
  handleThemeChanger: PropTypes.func,
  mapKey: PropTypes.string,
};

function mapStateToProps(store) {
  const { mapKey } = store.app.apiKeys;
  return {
    mapKey,
  };
}

export default connect(
  mapStateToProps,
  null,
)(Settings);
