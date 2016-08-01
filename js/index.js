'use strict';

var Board = React.createClass({
  displayName: 'Board',

  next: [],
  cells: [],
  stepping: null,
  step: function step() {
    for (var i = 0; i <= this.props.size + 1; i++) {
      for (var y = 0; y <= this.props.size + 1; y++) {
        this.next[i][y] = false;
      }
    }var neighbs = 0;

    for (i = 1; i <= this.props.size; i++) {
      for (y = 1; y <= this.props.size; y++, neighbs = 0) {

        if (this.cells[i - 1][y - 1]) neighbs++;
        if (this.cells[i - 1][y]) neighbs++;
        if (this.cells[i - 1][y + 1]) neighbs++;
        if (this.cells[i][y - 1]) neighbs++;
        if (this.cells[i][y + 1]) neighbs++;
        if (this.cells[i + 1][y - 1]) neighbs++;
        if (this.cells[i + 1][y]) neighbs++;
        if (this.cells[i + 1][y + 1]) neighbs++;

        if (this.cells[i][y]) {
          if (neighbs < 2 || neighbs > 3) {
            this.next[i][y] = false;
            continue;
          } else {
            this.next[i][y] = true;
            continue;
          }
        } else if (neighbs == 3) this.next[i][y] = true;
      }
    }var rows = [];
    for (i = 1; i <= this.props.size; i++) {
      for (y = 1; y <= this.props.size; y++) {
        this.cells[i][y] = this.next[i][y];
      }

      rows.push(this.createCollumns(this.cells[i]));
    }

    this.state.rows = rows;
    this.state.generation++;
    this.setState(this.state);
  },
  set: function set(x, y, sign) {
    this.cells[x][y] = sign;

    this.state.rows[x - 1] = this.createCollumns(this.cells[x]);

    this.setState(this.state);
    return sign;
  },
  createCollumns: function createCollumns(cells) {

    var collumns = [];

    for (var y = 0, x = 1; y < this.props.size; y++, x++) {
      collumns.push(React.createElement(
        'td',
        { className: cells[x] ? 'alive' : '',
          onMouseDown: CellEvents.downCell.bind(this),
          onMouseOver: CellEvents.overCell.bind(this),
          onMouseUp: CellEvents.upCell.bind(this) },
        '   '
      ));
    }return React.createElement(
      'tr',
      null,
      ' ',
      collumns,
      ' '
    );
  },
  getInitialState: function getInitialState() {

    var offsetForRandom = window.innerWidth <= 1280 ? 0.15 : 0.5;

    for (var i = 0; i <= this.props.size + 1; i++) {
      this.next[i] = [];this.cells[i] = [];
      for (var y = 0; y <= this.props.size + 1; y++) {
        this.next[i][y] = false;
        this.cells[i][y] = Math.floor(Math.random() + offsetForRandom);
      }
    }

    var rows = [];for (var x = 0; x < this.props.size; x++) {
      rows.push(this.createCollumns(this.cells[x + 1]));
    }setTimeout(function () {
      this.startStepping(this.props);
    }.bind(this), 300);
    return { rows: rows, generation: 0 };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.startStepping(nextProps);
  },
  clearBoard: function clearBoard() {

    var rows = [];
    for (var i = 0; i <= this.props.size + 1; i++) {
      for (var y = 0; y <= this.props.size + 1; y++) {
        this.cells[i][y] = false;
      }
    }for (i = 1; i <= this.props.size; i++) {
      rows.push(this.createCollumns(this.cells[i]));
    }this.setState({ rows: rows, generation: 0 });
  },
  startStepping: function startStepping(nextProps) {
    if (!nextProps.begin && this.stepping != null) {
      clearInterval(this.stepping);
    } else {
      clearInterval(this.stepping);
      this.stepping = setInterval(this.step, nextProps.timeInterval);
    }
  },
  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'h3',
        { className: 'generation' },
        ' Generations: ',
        this.state.generation,
        ' '
      ),
      React.createElement(
        'table',
        null,
        ' ',
        this.state.rows,
        ' '
      )
    );
  }

});

var CellEvents = {

  browserMSIE: navigator.userAgent.indexOf("MSIE") != -1 ? true : false,
  overCell: function overCell(elt) {

    if (!this.state.click) return;

    var x = $(elt.target).parent().index() + 1;
    var y = $(elt.target).index() + 1;

    this.set(x, y, true);
  },
  downCell: function downCell(elt) {

    if (elt.button != undefined) {
      if (this.borwserMSIE && elt.button != 1 || elt.button != 0) return;
    } else return console.err("elt.button == undefined");

    this.state.click = true;
    var x = $(elt.target).parent().index() + 1;
    var y = $(elt.target).index() + 1;

    this.set(x, y, !this.cells[x][y]);
  },
  upCell: function upCell(elt) {
    this.state.click = false;
  }

};

var App = React.createClass({
  displayName: 'App',

  board: null,
  getInitialState: function getInitialState() {
    return { begin: true, timeInterval: 80, clearGame: false };
  },
  startGame: function startGame() {
    this.state.begin = !this.state.begin;
    this.setState(this.state);
  },
  clearGame: function clearGame() {
    this.state.begin = false;
    this.state.generation = 0;
    this.setState(this.state);

    this.refs['board'].clearBoard();
  },
  componentDidMount: function componentDidMount() {
    var self = this;
    $(".slider").slider({
      value: 80,
      min: 40,
      max: 400,
      step: 40,
      slide: function slide(event, ui) {
        self.state.timeInterval = ui.value;
        self.setState(self.state);
      }
    });
  },
  render: function render() {

    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'buttonPanel' },
        React.createElement('i', { className: "fa fa-play-circle " + (this.state.begin ? "started" : ""), 'aria-hidden': 'true', onClick: this.startGame }),
        React.createElement(
          'div',
          { className: 'slider' },
          ' '
        ),
        React.createElement(
          'h1',
          { className: 'clear', onClick: this.clearGame },
          ' clear '
        )
      ),
      React.createElement(
        'div',
        { className: 'board' },
        React.createElement(Board, {
          ref: 'board',
          size: 32,
          begin: this.state.begin,
          timeInterval: this.state.timeInterval }),
        ';'
      ),
      React.createElement(
        'div',
        { className: 'footer' },
        React.createElement(
          'h2',
          null,
          ' Inspired by: '
        ),
        React.createElement(
          'a',
          { href: 'http://codepen.io/Evan-Goode/pen/jPBobv' },
          'http://codepen.io/Evan-Goode/pen/jPBobv'
        ),
        React.createElement('br', null),
        React.createElement(
          'a',
          { href: 'https://codepen.io/imtoobose/pen/QEgVQJ' },
          'https://codepen.io/imtoobose/pen/QEgVQJ'
        )
      )
    );
  }

});

window.onload = function () {

  PointerEventsPolyfill.initialize({});

  var jumbotronIntro = document.getElementById('mJumbotron');

  for (var i = 1; i <= 3; i++) {

    console.log("i: " + i);
    setTimeout(function (i) {
      return function () {

        if (3 - i == 0) {
          $(jumbotronIntro).css('display', 'none');
          return;
        }

        jumbotronIntro.innerHTML = 3 - i;
      };
    }(i), i * 1000);
  }

  setTimeout(function () {

    ReactDOM.render(React.createElement(App, null), document.getElementById("content"));
  }, 3000);
};