/**
 * Created by sohobloo on 16/9/13.
 */

'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  NativeModules,
  StyleSheet,
  Dimensions,
  PixelRatio,
  View,
  Text,
  ListView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
} from 'react-native';

export default class ModalDropdown extends Component {
  static defaultProps = {
    disabled: false,
    defaultIndex: -1,
    defaultValue: 'Please select...',
  };

  static propTypes = {
    disabled: PropTypes.bool,
    showDropdown: PropTypes.bool,

    defaultIndex: PropTypes.number,
    defaultValue: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),

    style: PropTypes.object,
    textStyle: PropTypes.object,
    dropdownStyle: PropTypes.object,

    renderRow: PropTypes.func,

    onDropdownWillShow: PropTypes.func,
    onDropdownWillHide: PropTypes.func,
    onSelect: PropTypes.func,
    //onClose: PropTypes.func,
  };

  constructor(props) {
    alert(props); // DEBUG
    super(props);

    this.updatePosition = this.updatePosition.bind(this);

    this._button = null;
    this._buttonFrame = null;

    this.state = {
      disabled: props.disabled,
      loading: !props.options,
      showDropdown: false,
      buttonText: props.defaultValue,
      selectedIndex: props.defaultIndex,
    };
  }

  componentDidMount() {
    setTimeout(this.updatePosition, 0);
  }

  componentDidUpdate() {
    setTimeout(this.updatePosition, 0);
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      loading: !nextProps.options,
    };
  }

  render() {
    return (
      <View style={this.props.style}>
        {this._renderButton()}
        {this._renderModal()}
      </View>
    );
  }

  updatePosition() {
    if (this._button && this._button.measure) {
      this._button.measure((fx, fy, width, height, px, py) => {
        this._buttonFrame = {x: px, y: py, w: width, h: height};
      });
    }
  }

  _renderButton() {
    return (
      <TouchableOpacity ref={button => this._button = button}
                        disabled={this.props.disabled}
                        onPress={this._onButtonPress.bind(this)}>
        <View style={[styles.button, this.props.style]}>
          <Text style={[styles.buttonText, this.props.textStyle]}
                numberOfLines={1}>
            {this.state.buttonText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  _onButtonPress() {
    alert('_onButtonPress');
    if (!this.props.onDropdownWillShow ||
      this.props.onDropdownWillShow() !== false) {
      this.setState({
        showDropdown: true,
      });
    }
  }

  _renderModal() {
    if (this.state.showDropdown && this._buttonFrame) {
      let frameStyle = this._calcPosition();
      alert(frameStyle);
      return (
        <Modal animationType='fade'
               transparent={true}
               onClose={this._onModalClose.bind(this)}>
          <TouchableWithoutFeedback onPress={this._onModalPress.bind(this)}>
            <View style={styles.modal}>
              <View style={[styles.dropdown, this.props.dropdownStyle, frameStyle]}>
                {this.state.loading ? this._renderLoading() : this._renderDropdown()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      );
    }
  }

  _calcPosition() {
    let dimensions = Dimensions.get('window');
    let windowWidth = dimensions.width;
    let windowHeight = dimensions.height;
    let dropdownWidth = this.props.dropdownStyle && this.props.dropdownStyle.width ||
      this.props.style && this.props.style.width ||
      this.style.button.width;
    let dropdownHeight = this.props.dropdownStyle && this.props.dropdownStyle.height ||
      this.styles.dropdown.height;

    let buttonBottom = windowHeight - this._buttonFrame.y - this._buttonFrame.height;
    let showInBottom = buttonBottom > dropdownHeight || buttonBottom >= this._buttonFrame.y;
    let buttonRight = windowWidth - this._buttonFrame.x - this._buttonFrame.width;
    let showInLeft = buttonRight >= this._buttonFrame.x;

    return ({
      width: dropdownWidth,
      height: dropdownHeight,
      top: showInBottom ? buttonBottom : max(0, this._buttonFrame.y - dropdownHeight),
      left: showInLeft ? this._buttonFrame.x : max(0, buttonRight - dropdownWidth),
    });
  }

  _onModalClose() {
    alert('_onModalClose');
  }

  _onModalPress() {
    alert('_onModalPress');
    if (!this.props.onDropdownWillHide ||
      this.props.onDropdownWillHide() !== false) {
      this.setState({
        showDropdown: false,
      });
    }
  }

  _renderLoading() {
    return (
      <ActivityIndicator size='small'/>
    );
  }

  _renderDropdown() {
    return (
      <ListView style={styles.list}
                dataSource={this._dataSource}
                renderRow={this._renderRow}
                renderSeparator={this._renderSeparator}
                automaticallyAdjustContentInsets={false}
      />
    );
  }

  get _dataSource() {
    let ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    return ds.cloneWithRows(this.props.options);
  }

  _renderRow(rowData, sectionID, rowID, highlightRow) {
    let key = `row_${rowID}`;
    let highlighted = rowID == this.state.selectedIndex
    let row = !this.props.renderRow ?
      (<View style={styles.row}>
        <Text style={[styles.rowText, highlighted && styles.highlightedRowText]}>
          {rowData}
        </Text>
      </View>) :
      this.props.renderRow(rowData, rowID);
    return (
      <TouchableHighlight key={key}
                          onPress={() => {this._onRowPress(rowData, sectionID, rowID, highlightRow).bind(this);}}>
        {row}
      </TouchableHighlight>
    );
  }

  _onRowPress(rowData, sectionID, rowID, highlightRow) {
    alert('_onRowPress');
    if (!this.props.onSelect ||
      this.props.onSelect(rowID, rowData) !== false) {
      highlightRow(sectionID, rowID);
      this.setState({
        buttonText: rowData,
        selectedIndex: rowID,
      });
    }
    if (!this.props.onDropdownWillHide ||
      this.props.onDropdownWillHide() !== false) {
      this.setState({
        showDropdown: false,
      });
    }
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    if (rowID === this.props.options.length - 1) return;
    let key = `spr_${rowID}`;
    return (<View style={styles.separator}
            key={key}
      />);
  }
}

const styles = StyleSheet.create({
  button: {
    width: 300 * PixelRatio.get(),
    height: 60 * PixelRatio.get(),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgray',
    borderRadius: 4 * PixelRatio.get(),
    justifyContent: 'center',
  },
  buttonText: {
    marginHorizontal: 8 * PixelRatio.get(),
    fontSize: 36 * PixelRatio.get(),
  },
  modal: {
    flex: 1,
  },
  dropdown: {
    height: (40 * PixelRatio.get() + StyleSheet.hairlineWidth) * 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgray',
    borderRadius: 4 * PixelRatio.get(),
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  loading: {
    alignSelf: 'center',
  },
  list: {
    flex: 1,
  },
  row: {
    flex: 1,
    height: 40 * PixelRatio.get(),
    justifyContent: 'center',
  },
  rowText: {
    marginHorizontal: 8 * PixelRatio.get(),
    fontSize: 32 * PixelRatio.get(),
    color: 'gray',
  },
  highlightedRowText: {
    color: 'black',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'lightgray',
  }
});