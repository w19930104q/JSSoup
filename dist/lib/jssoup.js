"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _builder = _interopRequireDefault(require("./builder.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var htmlparser = require('htmlparser');

var SoupSelector = require('jssoup-selector')["default"];

var JSSoupAdapter = require('./jssoup_adapter')["default"];

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  try {
    htmlparser = Tautologistics.NodeHtmlParser;
  } catch (e) {}
} else {
  htmlparser = Tautologistics.NodeHtmlParser;
} // Walk up the parent chain to find the document root a node belongs to.


function getRootElement(node) {
  var cur = node;

  while (cur && cur.parent) {
    cur = cur.parent;
  }

  return cur;
} // True when maybeAncestor is a strict ancestor of node (on its parent chain,
// but not the node itself). Works across documents: a node from another
// document can never be on this node's parent chain.


function isAncestor(maybeAncestor, node) {
  if (!maybeAncestor || !node) return false;
  var cur = node.parent;

  while (cur) {
    if (cur === maybeAncestor) return true;
    cur = cur.parent;
  }

  return false;
}

var SoupElement = /*#__PURE__*/function () {
  function SoupElement() {
    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var previousElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var nextElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, SoupElement);

    this.parent = parent;
    this.previousElement = previousElement;
    this.nextElement = nextElement;
  }

  _createClass(SoupElement, [{
    key: "nextSibling",
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == this.parent.contents.length - 1) return undefined;
      return this.parent.contents[index + 1];
    }
  }, {
    key: "previousSibling",
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == 0) return undefined;
      return this.parent.contents[index - 1];
    }
  }, {
    key: "nextSiblings",
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == this.parent.contents.length - 1) return undefined;
      return this.parent.contents.slice(index + 1);
    }
  }, {
    key: "previousSiblings",
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == 0) return undefined;
      return this.parent.contents.slice(0, index);
    } // remove item from dom tree

  }, {
    key: "extract",
    value: function extract() {
      // a detached node or a document root has nothing to extract. Removing the
      // root would break the traversal chain and make its descendants unreachable.
      if (!this.parent) {
        return;
      }

      var extractFirst = this;
      var extractLast = this;
      var descendants = this.descendants;

      if (descendants && descendants.length) {
        extractLast = descendants[descendants.length - 1];
      } // these two maybe null


      var before = this.previousElement;
      var after = extractLast.nextElement; // modify extract subtree

      extractFirst.previousElement = null;
      extractLast.nextElement = null;

      if (before) {
        before.nextElement = after;
      }

      if (after) {
        after.previousElement = before;
      } //remove node from contents array


      if (this.parent) {
        var index = this.parent.contents.indexOf(this);

        if (index >= 0) {
          this.parent.contents.splice(index, 1);
        }
      }

      this.parent = null;
    } // Validate an insert without touching any document. Throws on any cycle,
    // boundary or type violation so callers can guarantee atomicity.

  }, {
    key: "_validateInsert",
    value: function _validateInsert(index, newElement) {
      if (newElement == null) {
        throw "Cannot insert null element!";
      }

      if (newElement === this) {
        throw "Cannot add one itself!";
      }

      if (!(this instanceof SoupTag)) {
        throw "insert is not support in " + this.constructor.name;
      }

      if (typeof index != 'number' || index < 0 || !Number.isInteger(index)) {
        throw "index cannot be negative!";
      }

      if (newElement instanceof JSSoup) {
        // validate every planned move before any of them is performed, so a
        // failing batch leaves both documents untouched.
        var elements = newElement.contents;

        for (var i = 0; i < elements.length; ++i) {
          this._validateInsert(index + i, elements[i]);
        }

        return;
      }

      if (typeof newElement != 'string' && !(newElement instanceof SoupElement)) {
        throw "Cannot insert element of type " + _typeof(newElement) + "!";
      } // cycle / parent-child boundary check: inserting an ancestor of this node
      // (including the document root) would create a loop and detach the subtree.


      if (isAncestor(newElement, this)) {
        throw "Cannot insert an ancestor element into its descendant!";
      }
    }
  }, {
    key: "insert",
    value: function insert(index, newElement) {
      this._validateInsert(index, newElement); // expand a whole document into its top level elements.


      if (newElement instanceof JSSoup) {
        // snapshot first: moving each child extracts it from contents, which
        // mutates the array we are iterating over.
        var elements = newElement.contents.slice();

        for (var i = 0; i < elements.length; ++i) {
          this.insert(index + i, elements[i]);
        }

        return;
      }

      if (typeof newElement == 'string') {
        newElement = new SoupString(newElement);
      }

      index = Math.min(index, this.contents.length);

      if (newElement.parent) {
        if (newElement.parent === this) {
          var curIndex = this.contents.indexOf(newElement);
          if (index == curIndex) return;

          if (index > curIndex) {
            --index;
          }
        }

        newElement.extract();
      }

      var count = this.contents.length;
      var descendantsOfNewElement = newElement.descendants;
      var lastElementOfNewElement = descendantsOfNewElement && descendantsOfNewElement.length > 0 ? descendantsOfNewElement[descendantsOfNewElement.length - 1] : newElement; // handle previous element of newElement

      if (index == 0) {
        newElement.previousElement = this;
      } else {
        var previousChild = this.contents[index - 1];
        var previousDescendants = previousChild.descendants;
        newElement.previousElement = previousDescendants && previousDescendants.length > 0 ? previousDescendants[previousDescendants.length - 1] : previousChild;
      }

      if (newElement.previousElement) {
        newElement.previousElement.nextElement = newElement;
      } // handle next element of newElement


      if (index < count) {
        lastElementOfNewElement.nextElement = this.contents[index];
      } else {
        var parent = this;
        var parentNextSibling = null;

        while (!parentNextSibling && parent) {
          parentNextSibling = parent.nextSibling;
          parent = parent.parent;
        }

        if (parentNextSibling) {
          lastElementOfNewElement.nextElement = parentNextSibling;
        } else {
          lastElementOfNewElement.nextElement = null;
        }
      }

      if (lastElementOfNewElement.nextElement) {
        lastElementOfNewElement.nextElement.previousElement = lastElementOfNewElement;
      }

      newElement.parent = this;
      this.contents.splice(index, 0, newElement);
    }
  }, {
    key: "replaceWith",
    value: function replaceWith(newElement) {
      if (this.parent == null) {
        throw "Cannot replace element without parent!";
      }

      if (newElement === this) {
        return;
      }

      if (newElement == null) {
        throw "Cannot replace element with null!";
      }

      if (newElement instanceof JSSoup) {
        // delegate after the boundary checks below: a document root that
        // contains this node would create a cycle.
        if (isAncestor(newElement, this)) {
          throw "Cannot replace element with its ancestor!";
        }
      } else {
        if (typeof newElement != 'string' && !(newElement instanceof SoupElement)) {
          throw "Cannot replace element with type " + _typeof(newElement) + "!";
        } // cycle / parent-child boundary check: replacing a node with one of its
        // ancestors (its direct parent, grandparent, ...) would create a loop.


        if (isAncestor(newElement, this)) {
          if (newElement === this.parent) {
            throw "Cannot replace element with its parent!";
          }

          throw "Cannot replace element with its ancestor!";
        }
      } // all checks passed: only now may documents be modified


      var parent = this.parent;
      var index = parent.contents.indexOf(this);
      this.extract();
      parent.insert(index, newElement);
      return this;
    }
  }]);

  return SoupElement;
}();

var SoupComment = /*#__PURE__*/function (_SoupElement) {
  _inherits(SoupComment, _SoupElement);

  var _super = _createSuper(SoupComment);

  function SoupComment(text) {
    var _this;

    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupComment);

    _this = _super.call(this, parent, previousElement, nextElement);
    _this._text = text;
    return _this;
  }

  return SoupComment;
}(SoupElement);

var SoupString = /*#__PURE__*/function (_SoupElement2) {
  _inherits(SoupString, _SoupElement2);

  var _super2 = _createSuper(SoupString);

  function SoupString(text) {
    var _this2;

    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupString);

    _this2 = _super2.call(this, parent, previousElement, nextElement);
    _this2._text = text;
    return _this2;
  }

  return SoupString;
}(SoupElement);

SoupString.prototype.toString = function () {
  return this._text;
};

var SoupDoctypeString = /*#__PURE__*/function (_SoupString) {
  _inherits(SoupDoctypeString, _SoupString);

  var _super3 = _createSuper(SoupDoctypeString);

  function SoupDoctypeString(text) {
    var _this3;

    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupDoctypeString);

    _this3 = _super3.call(this, text, parent, previousElement, nextElement);
    _this3._text = text;
    return _this3;
  }

  return SoupDoctypeString;
}(SoupString);

SoupDoctypeString.prototype.toString = function () {
  return "<" + this._text + ">";
};

var SoupTag = /*#__PURE__*/function (_SoupElement3) {
  _inherits(SoupTag, _SoupElement3);

  var _super4 = _createSuper(SoupTag);

  function SoupTag(name, builder) {
    var _this4;

    var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var previousElement = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var nextElement = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

    _classCallCheck(this, SoupTag);

    _this4 = _super4.call(this, parent, previousElement, nextElement);
    _this4.name = name;
    _this4.contents = [];
    _this4.attrs = attrs || {};
    _this4.hidden = false;
    _this4.builder = builder;
    return _this4;
  }

  _createClass(SoupTag, [{
    key: "_append",
    value: function _append(child) {
      if (child) this.contents.push(child);
    }
    /*
     * Build a soup object tree
     */

  }, {
    key: "_build",
    value: function _build(children) {
      if (!children || children.length < 1) return this;
      var last = this;

      for (var i = 0; i < children.length; ++i) {
        var ele = this._transform(children[i]);

        last.nextElement = ele;
        ele.previousElement = last;

        if (ele instanceof SoupTag) {
          last = ele._build(children[i].children);
        } else {
          last = ele;
        }

        this._append(ele);
      }

      return last;
    }
    /*
     * It's a soup object factory
     * It consturcts a soup object from dom.
     */

  }, {
    key: "_transform",
    value: function _transform(dom) {
      if (!dom) return null;

      if (dom.type === 'text') {
        return new SoupString(dom.data, this);
      } else if (dom.type === 'comment') {
        return new SoupComment(dom.data, this);
      } else if (dom.type === 'directive') {
        //<!**
        if (dom.name === '!DOCTYPE') {
          return new SoupDoctypeString(dom.data, this);
        }
      }

      return new SoupTag(dom.name, this.builder, dom.attribs, this);
    }
  }, {
    key: "string",
    get: function get() {
      var cur = this;

      while (cur && cur.contents && cur.contents.length == 1) {
        cur = cur.contents[0];
      }

      if (!cur || cur instanceof SoupTag) return undefined;
      return cur;
    }
  }, {
    key: "find",
    value: function find() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var r = this.findAll(name, attrs, string);
      if (r.length > 0) return r[0];
      return undefined;
    }
    /*
     * like find_all in BeautifulSoup
     */

  }, {
    key: "findAll",
    value: function findAll() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var results = [];
      var strainer = new SoupStrainer(name, attrs, string);
      var descendants = this.descendants;

      for (var i = 0; i < descendants.length; ++i) {
        if (descendants[i] instanceof SoupTag) {
          var tag = strainer.match(descendants[i]);

          if (tag) {
            results.push(tag);
          }
        }
      }

      return results;
    }
  }, {
    key: "findPreviousSibling",
    value: function findPreviousSibling() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var results = this.findPreviousSiblings(name, attrs, string);

      if (results.length > 0) {
        return results[0];
      }

      return undefined;
    }
  }, {
    key: "findPreviousSiblings",
    value: function findPreviousSiblings() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var results = [];
      var cur = this.previousSibling;
      var strainer = new SoupStrainer(name, attrs, string);

      while (cur) {
        if (cur instanceof SoupTag) {
          var tag = strainer.match(cur);

          if (tag) {
            results.push(tag);
          }
        }

        cur = cur.previousSibling;
      }

      return results;
    }
  }, {
    key: "findNextSibling",
    value: function findNextSibling() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var results = this.findNextSiblings(name, attrs, string);

      if (results.length > 0) {
        return results[0];
      }

      return undefined;
    }
  }, {
    key: "findNextSiblings",
    value: function findNextSiblings() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var results = [];
      var cur = this.nextSibling;
      var strainer = new SoupStrainer(name, attrs, string);

      while (cur) {
        if (cur instanceof SoupTag) {
          var tag = strainer.match(cur);

          if (tag) {
            results.push(tag);
          }
        }

        cur = cur.nextSibling;
      }

      return results;
    }
  }, {
    key: "getText",
    value: function getText() {
      var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var text = [];
      var descendants = this.descendants;

      for (var i = 0; i < descendants.length; ++i) {
        if (descendants[i] instanceof SoupString) {
          text.push(descendants[i]._text);
        }
      }

      return text.join(separator);
    }
  }, {
    key: "text",
    get: function get() {
      return this.getText();
    }
  }, {
    key: "descendants",
    get: function get() {
      var ret = [];
      var cur = this.nextElement;

      while (cur) {
        var parent = cur.parent;

        while (parent && parent != this) {
          parent = parent.parent;
        }

        if (!parent) break;
        ret.push(cur);
        cur = cur.nextElement;
      }

      return ret;
    }
  }, {
    key: "_convertAttrsToString",
    value: function _convertAttrsToString() {
      var text = '';
      if (!this.attrs) return text;

      for (var key in this.attrs) {
        if (Array.isArray(this.attrs[key])) {
          text += key + '="' + this.attrs[key].join(' ') + '" ';
        } else {
          text += key + '="' + this.attrs[key] + '" ';
        }
      }

      text = text.trim();
      return text;
    }
  }, {
    key: "_prettify",
    value: function _prettify(indent, breakline) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var text = '';

      if (this.hidden && level == 0) {
        --level;
      }

      if (!this.hidden) {
        var attrs = this._convertAttrsToString();

        if (attrs) {
          text += indent.repeat(level) + '<' + this.name + ' ' + attrs;
        } else {
          text += indent.repeat(level) + '<' + this.name;
        }
      } // is an element doesn't have any contents, it's a self closing element


      if (!this.hidden) {
        if (this._isEmptyElement() && this.builder.canBeEmptyElement(this.name)) {
          text += ' />' + breakline;
          return text;
        } else {
          text += '>' + breakline;
        }
      }

      for (var i = 0; i < this.contents.length; ++i) {
        if (this.contents[i] instanceof SoupString) {
          var curText = this.contents[i].toString();
          curText = curText.trim();

          if (curText.length != 0) {
            if (curText.substring(curText.length - 1) == "\n") {
              text += indent.repeat(level + 1) + curText;
            } else {
              text += indent.repeat(level + 1) + curText + breakline;
            }
          }
        } else {
          if (this.contents[i] instanceof SoupComment) {
            text += indent.repeat(level + 1) + "<!--" + this.contents[i]._text + "-->" + breakline;
          } else {
            text += this.contents[i]._prettify(indent, breakline, level + 1);
          }
        }
      }

      if (!this.hidden) {
        text += indent.repeat(level) + '</' + this.name + '>' + breakline;
      }

      return text;
    }
  }, {
    key: "prettify",
    value: function prettify() {
      var indent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ' ';
      var breakline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\n';
      return this._prettify(indent, breakline).trim();
    }
    /*
     * Append item in contents
     */

  }, {
    key: "append",
    value: function append(item) {
      var pre = this;
      var next = this.nextElement;
      var appendFirst = item;
      var appendLast = item;
      var itemDescendants = item.descendants;

      if (itemDescendants && itemDescendants.length > 0) {
        appendLast = itemDescendants[itemDescendants.length - 1];
      }

      var descendants = this.descendants;

      if (descendants && descendants.length > 0) {
        pre = descendants[descendants.length - 1];
        next = pre.nextElement;
      } //merge two SoupString


      if (item instanceof SoupString && pre instanceof SoupString) {
        pre._text += item._text;
        return;
      }

      appendFirst.previousElement = pre;
      appendLast.nextElement = next;
      if (pre) pre.nextElement = appendFirst;
      if (next) next.previousElement = appendLast;
      this.contents.push(item);
      item.parent = this;
    }
  }, {
    key: "_isEmptyElement",
    value: function _isEmptyElement() {
      return this.contents.length == 0;
    }
  }, {
    key: "select",
    value: function select(expression) {
      var selector = new SoupSelector(new JSSoupAdapter());
      return selector.select(expression, this);
    }
  }, {
    key: "selectOne",
    value: function selectOne(expression) {
      var elements = this.select(expression);

      if (elements && elements.length > 0) {
        return elements[0];
      }

      return null;
    }
  }]);

  return SoupTag;
}(SoupElement);

SoupTag.prototype.toString = function () {
  return this.prettify('', '');
};

var ROOT_TAG_NAME = '[document]';

var JSSoup = /*#__PURE__*/function (_SoupTag) {
  _inherits(JSSoup, _SoupTag);

  var _super5 = _createSuper(JSSoup);

  function JSSoup(text) {
    var _this5;

    var ignoreWhitespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, JSSoup);

    _this5 = _super5.call(this, ROOT_TAG_NAME, new _builder["default"](), null);
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error);
      } else {}
    }, {
      verbose: false,
      ignoreWhitespace: ignoreWhitespace
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(text);

    if (Array.isArray(handler.dom)) {
      _this5._build(handler.dom);
    } else {
      _this5._build([handler.dom]);
    }

    _this5.hidden = true;
    return _this5;
  }

  return JSSoup;
}(SoupTag);

exports["default"] = JSSoup;

var SoupStrainer = /*#__PURE__*/function () {
  function SoupStrainer(name, attrs, string) {
    _classCallCheck(this, SoupStrainer);

    if (typeof attrs == 'string') {
      attrs = {
        "class": [attrs]
      };
    } else if (Array.isArray(attrs)) {
      attrs = {
        "class": attrs
      };
    } else if (attrs && attrs["class"] && typeof attrs["class"] == 'string') {
      attrs["class"] = [attrs["class"]];
    }

    if (attrs && attrs["class"]) {
      for (var i = 0; i < attrs["class"].length; ++i) {
        attrs["class"][i] = attrs["class"][i].trim();
      }
    }

    this.name = name;
    this.attrs = attrs;
    this.string = string;
  }

  _createClass(SoupStrainer, [{
    key: "match",
    value: function match(tag) {
      // match string
      if (this.name == undefined && this.attrs == undefined) {
        if (this.string) {
          if (this._matchName(tag.string, this.string)) return tag.string;else return null;
        }

        return tag;
      } // match tag name


      var match = this._matchName(tag.name, this.name);

      if (!match) return null; // match string

      match = this._matchName(tag.string, this.string);
      if (!match) return null; // match attributes

      if (_typeof(this.attrs) == 'object') {
        if (!this._isEmptyObject(this.attrs)) {
          var props = Object.getOwnPropertyNames(this.attrs);
          var found = false;

          for (var i = 0; i < props.length; ++i) {
            if (props[i] in tag.attrs && this._matchAttrs(props[i], tag.attrs[props[i]], this.attrs[props[i]])) {
              found = true;
              break;
            }
          }

          if (!found) return null;
        }
      }

      return tag;
    }
  }, {
    key: "_matchName",
    value: function _matchName(tagItem, name) {
      if (name == undefined || name == null) return true; // if name is an array, then tag match any item in this array is a match.

      if (Array.isArray(name)) {
        for (var i = 0; i < name.length; ++i) {
          var match = this._matchName(tagItem, name[i]);

          if (match) return true;
        }

        return false;
      }

      return tagItem == name;
    }
  }, {
    key: "_matchAttrs",
    value: function _matchAttrs(name, candidateAttrs, attrs) {
      if (typeof candidateAttrs == 'string') {
        if (name == 'class') {
          candidateAttrs = candidateAttrs.replace(/\s\s+/g, ' ').trim().split(' ');
        } else {
          candidateAttrs = [candidateAttrs];
        }
      }

      if (typeof attrs == 'string') {
        attrs = [attrs];
      }

      for (var i = 0; i < attrs.length; ++i) {
        if (candidateAttrs.indexOf(attrs[i]) < 0) return false;
      }

      return true;
    }
  }, {
    key: "_isEmptyObject",
    value: function _isEmptyObject(obj) {
      return Object.keys(obj).length == 0;
    }
  }]);

  return SoupStrainer;
}();