const assert = require('assert');
var expect = require('chai').expect;
import JSSoup from '../lib/jssoup';

const data = `
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <p class="title"><b>The Dormouse's story</b></p>

  <p class="story">Once upon a time there were three little sisters; and their names were
  <a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
  <a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
  <a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
  and they lived at the bottom of a well.</p>

  <p class="story">...</p>

  <span class="one">One</span>
  <span class="two">Two</span>
  <span class="three">Three</span>
  <span class="one two three">One Two Three</span>

  <div class=" whitespace">Whitespace Left</div>
  <div class="whitespace ">Whitespace Right</div>
  <div class=" whitespace ">Whitespace Left and Right</div>
  <div class="    so    much    whitespace    ">Whitespace</div>

  </body>
  </html>
`;

describe('contents', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.contents.length, 1);
    assert.equal(soup.contents[0].contents.length, 1);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello<b>aa</b>cc</a>');
    assert.equal(soup.contents.length, 1);
    assert.equal(soup.contents[0].contents.length, 3);
    done();
  });
});

describe('parent', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.parent, null);
    assert.equal(soup.contents[0].parent, soup);
    assert.equal(soup.contents[0].contents[0].parent, soup.contents[0]);
    done();
  });
});

describe('name', function() {
  it('should get correct name', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.name, '[document]');
    assert.equal(soup.contents[0].name, 'a');
    done();
  });

  it('should not have name for SoupString', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.contents[0].contents[0].name, undefined);
    done();
  });
});

describe('string', function() {
  it('should print text in first level without sub tag', function(done) {
    var soup = new JSSoup('<a>text</a>');
    assert.equal(soup.contents[0].string, 'text');
    done();
  });

  it('should print text in deepest level without sub tag', function(done) {
    var soup = new JSSoup('<a><b><c>text</c></b></a>');
    assert.equal(soup.string, 'text');
    done();
  });

  it('should return undefined with sub tag', function(done) {
    var soup = new JSSoup('<a>ab<b>text</b></a>');
    assert.equal(soup.string, undefined);
    done();
  });

  it('should return undefined with nothing', function(done) {
    var soup = new JSSoup('<a></a>');
    assert.equal(soup.string, undefined);
    done();
  });
});

describe('sibling', function() {
  it('should be OK without sibling', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.previousSibling, undefined);
    assert.equal(soup.nextSibling, undefined);
    assert.equal(soup.contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].nextSibling, undefined);
    assert.equal(soup.contents[0].contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].contents[0].nextSibling, undefined);
    assert.equal(soup.previousSiblings, undefined);
    assert.equal(soup.nextSiblings, undefined);
    assert.equal(soup.contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].nextSiblings, undefined);
    assert.equal(soup.contents[0].contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].contents[0].nextSiblings, undefined);
    done();
  });

  it('should be OK with sibling', function(done) {
    var soup = new JSSoup('<a>hello</a><b>df</b><c>df</c>');
    assert.equal(soup.contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].nextSibling.name, 'b');
    assert.equal(soup.contents[1].previousSibling.name, 'a');
    assert.equal(soup.contents[1].nextSibling.name, 'c');
    assert.equal(soup.contents[2].previousSibling.name, 'b');
    assert.equal(soup.contents[2].nextSibling, undefined);
    assert.equal(soup.contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].nextSiblings[0].name, 'b');
    assert.equal(soup.contents[0].nextSiblings[1].name, 'c');
    assert.equal(soup.contents[1].previousSiblings[0].name, 'a');
    assert.equal(soup.contents[1].nextSiblings[0].name, 'c');
    assert.equal(soup.contents[2].previousSiblings[0].name, 'a');
    assert.equal(soup.contents[2].previousSiblings[1].name, 'b');
    assert.equal(soup.contents[2].nextSiblings, undefined);
    done();
  });
});

describe('attrs', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2 h3">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });
});


describe('extract', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var a = soup.contents[0];
    a.extract();
    assert.equal(a.parent, null);
    assert.equal(soup.contents.length, 0);
    done();
  });

  it('should be OK with SoupString', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var text = soup.find(undefined, undefined, 'hello');
    text.extract();
    assert.equal(soup.contents[0].nextElement, null);
    assert.equal(soup.descendants.length, 1);
    assert.equal(soup.text, '');
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    a.extract();
    assert.equal(soup.nextElement, b);
    assert.equal(soup, b.previousElement);
    assert.equal(b.nextElement.nextElement, c);
    assert.equal(before, soup.descendants.length + 2);
    assert.equal(a.nextElement.toString(), '1');
    assert.equal(a.nextElement.nextElement, null);
    done();
  });

  it('should be OK with no sub contents', function(done) {
    var soup = new JSSoup('<a class="hi"></a><b></b><c></c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.equal(soup.nextElement, a);
    assert.equal(soup, a.previousElement);
    assert.equal(a.nextElement, c);
    assert.equal(c.previousElement, a);
    assert.equal(before, soup.descendants.length + 1);
    assert.equal(a.nextElement.nextElement, null);
    assert.equal(b.nextElement, null);
    assert.equal(b.previousElement, null);
    assert.equal(b.parent, null);
    done();
  });

  it('should be OK with combine function', function(done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.equal(soup.text, '13');
    soup.append(b);
    assert.equal(soup.text, '132');
    assert.equal(before, soup.descendants.length);
    assert.equal(c.nextElement.nextElement, b);
    assert.equal(b.previousElement.previousElement, c);
    done();
  });

});

describe('find', function() {
  it('should be OK to find div with DOCTYPE', function(done) {
    var text = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html><head><title>The Dormouse's story</title></head>
      <body>
      <div class="one">One</div>
      </body>
      </html>
    `;
    var soup = new JSSoup(text);
    var tag = soup.find('div');
    assert.equal(tag.text, 'One');
    done();
  });
})

describe('findAll', function() {
  it('should find all elements', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll();
    assert.equal(ret.length, 1);
    soup = new JSSoup(data);
    ret = soup.findAll();
    assert.equal(ret.length, 19);
    ret = soup.findAll('a');
    assert.equal(ret.length, 3);
    ret = soup.findAll('p');
    assert.equal(ret.length, 3);
    ret = soup.findAll('head');
    assert.equal(ret.length, 1);
    ret = soup.findAll('title');
    assert.equal(ret.length, 1);
    ret = soup.findAll('span');
    assert.equal(ret.length, 4);
    ret = soup.findAll('div');
    assert.equal(ret.length, 4);
    ret = soup.findAll('');
    assert.equal(ret.length, 0);
    done();
  });

  it('should be OK with only name as argument', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll('a');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'a');
    ret = soup.findAll('b');
    assert.equal(ret.length, 0);
    done();
  });

  it('should be OK with only string as argument', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll(undefined, undefined, 'hello');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].constructor.name, 'SoupString');
    ret = soup.findAll('a', undefined, 'hello');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].string, 'hello');
    assert.equal(ret[0].name, 'a');
    soup = new JSSoup(data);
    ret = soup.findAll(undefined, undefined, '...');
    assert.equal(ret.length, 1);
    assert.equal(ret[0], '...');
    ret = soup.findAll('p', undefined, '...');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'p');
    assert.equal(ret[0].string, '...');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('p', 'title');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'p');
    var ret2 = soup.findAll('p', {class: 'title'});
    assert.equal(ret2.length, 1);
    assert.equal(ret[0], ret2[0]);
    ret = soup.findAll('p', 'story');
    assert.equal(ret.length, 2);
    done();
  });

  it('should be OK with multiple classes', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('span', 'one');
    assert.equal(ret.length, 2);
    assert.equal(ret[0].name, 'span');
    var ret2 = soup.findAll('span', 'two');
    assert.equal(ret2.length, 2);
    assert.equal(ret2[0].name, 'span');
    var ret3 = soup.findAll('span', 'three');
    assert.equal(ret3.length, 2);
    assert.equal(ret3[0].name, 'span');
    done();
  });

  it('should be OK with whitespace in class definition', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('div', 'whitespace');
    assert.equal(ret.length, 4);
    assert.equal(ret[0].name, 'div');
    var ret2 = soup.findAll('div', ['whitespace']);
    assert.equal(ret2.length, 4);
    assert.equal(ret2[0].name, 'div');
    var ret3 = soup.findAll('div', {class: 'whitespace'});
    assert.equal(ret3.length, 4);
    assert.equal(ret3[0].name, 'div');
    var ret4 = soup.findAll('div', {class: ['whitespace']});
    assert.equal(ret4.length, 4);
    assert.equal(ret4[0].name, 'div');
    done();
  });

  it('should be OK with whitespace in class selector', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('div', 'whitespace ');
    assert.equal(ret.length, 4);
    assert.equal(ret[0].name, 'div');
    var ret2 = soup.findAll('div', ['whitespace ']);
    assert.equal(ret2.length, 4);
    assert.equal(ret2[0].name, 'div');
    var ret3 = soup.findAll('div', {class: 'whitespace '});
    assert.equal(ret3.length, 4);
    assert.equal(ret3[0].name, 'div');
    var ret4 = soup.findAll('div', {class: ['whitespace ']});
    assert.equal(ret4.length, 4);
    assert.equal(ret4[0].name, 'div');
    done();
  });

});

describe('prev next', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var cur = soup;
    var last = null;
    while (cur) {
      last = cur;
      cur = cur.nextElement;
    }
    while (last) {
      last = last.previousElement;
    }
    done();
  });
});

describe('descendants', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    assert.notEqual(soup.descendants, soup.descendants);
    var cur = soup.nextElement;
    for (let i of soup.descendants) {
      assert.equal(i, cur);
      cur = cur.nextElement;
    }
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<div><a></a><b></b></div>');
    var a = soup.nextElement.nextElement;
    assert.equal(a.descendants.length, 0);
    done();
  });
});

describe('getText', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>1<b>2</b>3</a>');
    assert.equal(soup.getText(), '123');
    assert.equal(soup.getText('|'), '1|2|3');
    assert.equal(soup.getText(), soup.text);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<div><a>1<b>2</b>3</a><c>4</c></div>');
    assert.equal(soup.getText(), '1234');
    assert.equal(soup.getText('|'), '1|2|3|4');
    assert.equal(soup.getText(), soup.text);
    done();
  });

  it('should preserve whitespace is set ignoreWhitespace false', function(done) {
    const html = `<p>
  <span contenteditable="false">blabla bla bla</span>
\t<strong style="color: rgb(203, 65, 64);"> </strong> here a double space bla bla
</p>`
    var soup = new JSSoup(html, false);
    assert.equal(soup.getText(), '\n  blabla bla bla\n\t  here a double space bla bla\n');
    done();
  });
});

describe('prettify', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>1<b>2</b>3</a>');
    assert.equal(soup.prettify(), '<a>\n 1\n <b>\n  2\n </b>\n 3\n</a>');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify(), '<a class="h1 h2" id="h3 h4">\n 1\n <b>\n  2\n </b>\n 3\n</a>');
    done();
  });

  it('should be OK with indent argument', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify('', ''), '<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify('\t', ''), '<a class="h1 h2" id="h3 h4">\t1\t<b>\t\t2\t</b>\t3</a>');
    assert.equal(soup.prettify('\t', ' '), '<a class="h1 h2" id="h3 h4"> \t1 \t<b> \t\t2 \t</b> \t3 </a>');
    done();
  });

  it('should be OK with comments', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>');
    assert.equal(soup.prettify('',''), '<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>');
    done();
  });

  it('should be OK with doctype', function(done) {
   var text = `
    <!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `
    var soup = new JSSoup(text);
    assert.equal(soup.prettify('',''), `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`);
    done();
  });

  it('should be able to skip DOCTYPE', function(done) {
   var text = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `
    var soup = new JSSoup(text);
    assert.equal(soup.prettify('',''), `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`);
    soup.nextElement.extract();
    assert.equal(soup.find("html").prettify('',''), `<html><head></head><body><div></div></body></html>`);
    done();
  });

  it('should be able to prettify for tag in builder', function(done) {
    var soup = new JSSoup('<meta charset="utf-8" />');
    assert.equal(soup.prettify('', ''), `<meta charset="utf-8" />`);
    done();
  });

  it('should be able to prettify tag not in builder', function(done) {
    var soup = new JSSoup('<script></script>');
    assert.equal(soup.prettify('', ''), `<script></script>`);
    done();
  });

  it('should be able to handle br', function(done) {
    var soup = new JSSoup('<br>');
    assert.equal(soup.prettify('', ''), `<br />`);
    soup = new JSSoup('<br/>');
    assert.equal(soup.prettify('', ''), `<br />`);
    done();
  });
});

describe('append', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    var text2 = soup.find(undefined, undefined, '2');
    assert.equal(text2, '2');
    text2.extract();
    var b = soup.find('b');
    assert.equal(b.contents.length, 0);
    assert.equal(text2.parent, null);
    var a = soup.find('a');
    a.append(text2);
    assert.equal(b.nextSibling, '32');
    assert.equal(b.nextSibling.nextSibling, null);
    assert.equal(b.nextElement, '32');
    assert.equal(b.nextElement.nextElement, null);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b></a>');
    var text2 = soup.find(undefined, undefined, '2');
    assert.equal(text2, '2');
    text2.extract();
    var b = soup.find('b');
    assert.equal(b.contents.length, 0);
    assert.equal(text2.parent, null);
    var a = soup.find('a');
    a.append(text2);
    assert.equal(b.nextSibling, '2');
    assert.equal(b.nextSibling.nextSibling, null);
    assert.equal(b.nextElement, '2');
    assert.equal(b.nextElement.nextElement, null);
    assert.equal(text2.parent, a);
    assert.equal(text2.previousSibling, b);
    assert.equal(text2.previousElement, b);
    assert.equal(text2.nextSibling, null);
    assert.equal(text2.nextElement, null);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b><c>3</c></a>');
    var a = soup.find('a');
    var b = soup.find('b');
    var c = soup.find('c');
    b.extract();
    a.append(b);
    assert.equal(c.nextSibling, b);
    assert.equal(c.nextSibling.nextSibling, undefined);
    assert.equal(b.nextSibling, null);
    assert.equal(c.nextElement, '3');
    assert.equal(c.nextElement.nextElement, b);
    assert.equal(b.nextElement, '2');
    assert.equal(b.nextElement.nextElement, null);
    assert.equal(b.nextElement.previousElement, b);
    assert.equal(b.previousElement, '3');
    assert.equal(b.parent, a);
    done();
  });
});

describe('findNextSiblings', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSiblings = span.findNextSiblings('span');
    assert.equal(nextSiblings.length, 3);
    assert.equal(nextSiblings[0].name, 'span');
    assert.equal(nextSiblings[1].name, 'span');
    assert.equal(nextSiblings[2].name, 'span');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSiblings = span.findNextSiblings('span', 'one');
    assert.equal(nextSiblings.length, 1);
    assert.equal(nextSiblings[0].name, 'span');
    done();
  });
});

describe('findNextSibling', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSibling = span.findNextSibling('span');
    assert.equal(nextSibling.name, 'span');
    assert.equal(nextSibling.text, 'Two');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSibling = span.findNextSibling('span', 'one');
    assert.equal(nextSibling.name, 'span');
    assert.equal(nextSibling.text, 'One Two Three');
    done();
  });
});

describe('findPreviousSiblings', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSiblings = span.findPreviousSiblings('span');
    assert.equal(previousSiblings.length, 2);
    assert.equal(previousSiblings[0].name, 'span');
    assert.equal(previousSiblings[1].name, 'span');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSiblings = span.findPreviousSiblings('span', 'one');
    assert.equal(previousSiblings.length, 1);
    assert.equal(previousSiblings[0].name, 'span');
    done();
  });
});

describe('findPreviousSibling', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSibling = span.findPreviousSibling('span');
    assert.equal(previousSibling.name, 'span');
    assert.equal(previousSibling.text, 'Two');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSibling = span.findPreviousSibling('span', 'one');
    assert.equal(previousSibling.name, 'span');
    assert.equal(previousSibling.text, 'One');
    done();
  });
});

describe('insert', function() {
  it('should throw exception for null element', function(done) {
    var soup = new JSSoup(data);
    expect(() => {soup.insert(0, null)}).to.throw();
    done();
  });

  it('should throw exception for node itself', function(done) {
    var soup = new JSSoup(data);
    var tag = soup.find('div');
    expect(() => {tag.insert(0, tag)}).to.throw();
    done();
  });

  it('should throw exception trying to insert into string', function(done) {
    var soup = new JSSoup(data);
    var p = soup.find('p');
    expect(() => {p.string.insert(0, 'new node')}).to.throw();
    done();
  });


  it('should throw exception trying to insert at negative position', function(done) {
    var soup = new JSSoup(data);
    var p = soup.find('p');
    var div = soup.find('div');
    expect(() => {p.insert(-1, div)}).to.throw();
    done();
  });

  it('should be able to insert string', function(done) {
    var soup = new JSSoup('<div><p>hello</p></div>');
    var p = soup.find('p');
    p.insert(1, ' world');
    assert.equal(p.getText(), 'hello world');
    done();
  });


  it('should not change if inserting child to current index', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(1, p2);
    assert.equal(oldText, soup.getText());
    done();
  });

  it('should change order if inserting child to begin', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(0, p2);
    assert.equal(soup.getText(), 'p2p1p3');
    done();
  });

  it('should change order if inserting child to end', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(100, p2);
    assert.equal(soup.getText(), 'p1p3p2');
    done();
  });

  it('should be able to insert at the end', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    soup.insert(100, p2);
    assert.equal(soup.getText(), 'p1p3p2');
    assert.equal(div.nextSibling.prettify('', ''), '<p id="p2">p2</p>');
    done();
  });

  it('should be able to insert node from another DOM', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    var div = fromSoup.find('div');
    var span = toSoup.find('span');
    span.insert(100, div);
    assert.equal(span.prettify('', ''), '<span><a href="http"></a><div><p id="p1">p1</p></div></span>');
    done();
  });

  it('should be able to insert JSSoup', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    toSoup.insert(100, fromSoup);
    assert.equal(toSoup.prettify('', ''), '<span><a href="http"></a></span><div><p id="p1">p1</p></div>');
    done();
  });
});


describe('replaceWith', function() {
  it('should throw exception if parent is null', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var p1 = soup.find('p', {'id': 'p1'});
    var p2 = soup.find('p', {'id': 'p2'});
    p1.extract();
    expect(() => {p1.replaceWith(p2)}).to.throw();
    done();
  });

  it('should throw exception if replace with one itself', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var old = soup.prettify();
    var p1 = soup.find('p', {'id': 'p1'});
    p1.replaceWith(p1);
    assert.equal(old, soup.prettify());
    done();
  });

  it('should throw exception if replace with ones parent', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    expect(() => {p1.replaceWith(div)}).to.throw();
    done();
  });

  it('should be able to replace one with another', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    var p2 = soup.find('p', {'id': 'p2'});
    p1.replaceWith(p2);
    assert.equal(div.prettify('', ''), '<div><p id="p2">p2</p><p id="p3">p3</p></div>');
    done();
  });

  it('should be able to replace SoupString', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    p1.string.replaceWith("hello");
    assert.equal(div.prettify('', ''), '<div><p id="p1">hello</p><p id="p2">p2</p></div>');
    done();
  });
});

describe('node movement integrity', function() {
  // Walk the whole tree and assert every structural invariant:
  //  - contents[i].parent === owner
  //  - nextElement/previousElement form a reciprocal, cycle-free chain
  //  - the chain visits every descendant exactly once (no overlaps)
  function assertIntegrity(root) {
    var treeSet = new Set();
    (function walk(node) {
      assert.ok(!treeSet.has(node), 'cycle detected in contents');
      treeSet.add(node);
      (node.contents || []).forEach(function(child) {
        assert.equal(child.parent, node, 'parent pointer mismatch');
        walk(child);
      });
    })(root);

    var chain = new Set();
    var cur = root.nextElement;
    var prev = root;
    while (cur) {
      assert.ok(!chain.has(cur), 'duplicate node in nextElement chain');
      chain.add(cur);
      assert.equal(cur.previousElement, prev, 'previousElement broken');
      assert.equal(prev.nextElement, cur, 'nextElement broken');
      prev = cur;
      cur = cur.nextElement;
    }

    var expected = treeSet.size - 1; // exclude root itself
    assert.equal(chain.size, expected, 'chain does not cover all descendants');
    assert.equal(root.descendants.length, expected, 'descendants count mismatch');
  }

  it('moves a node between two documents without breaking either tree', function(done) {
    var sourceHtml = '<div><p id="p1">p1</p><p id="p2">p2</p><p id="p3">p3</p></div>';
    var targetHtml = '<section><h1>title</h1><h2>subtitle</h2></section>';
    var fromSoup = new JSSoup(sourceHtml);
    var toSoup = new JSSoup(targetHtml);

    var p2 = fromSoup.find('p', {id: 'p2'});
    var section = toSoup.find('section');
    section.insert(1, p2);

    assert.equal(fromSoup.prettify('', ''), '<div><p id="p1">p1</p><p id="p3">p3</p></div>');
    assert.equal(toSoup.prettify('', ''),
      '<section><h1>title</h1><p id="p2">p2</p><h2>subtitle</h2></section>');
    // the moved node appears exactly once, in the target document only
    assert.equal(fromSoup.findAll('p').map(function(p) { return p.attrs.id; }).join(','), 'p1,p3');
    assert.equal(toSoup.findAll('p').map(function(p) { return p.attrs.id; }).join(','), 'p2');
    assert.equal(p2.parent, section);
    assertIntegrity(fromSoup);
    assertIntegrity(toSoup);
    done();
  });

  it('moves every top level node when inserting a whole JSSoup', function(done) {
    var fromSoup = new JSSoup('<a>1</a><b>2</b><c>3</c>');
    var toSoup = new JSSoup('<div><span>s</span></div>');
    var div = toSoup.find('div');

    div.insert(100, fromSoup);

    assert.equal(toSoup.prettify('', ''),
      '<div><span>s</span><a>1</a><b>2</b><c>3</c></div>');
    assert.equal(fromSoup.contents.length, 0);
    assertIntegrity(fromSoup);
    assertIntegrity(toSoup);
    done();
  });

  it('rejects a cross-document move that would cycle without modifying anything', function(done) {
    var fromSoup = new JSSoup('<a>1</a><b>2</b>');
    var toSoup = new JSSoup('<div><p>text</p></div>');
    var beforeFrom = fromSoup.prettify('', '');
    var beforeTo = toSoup.prettify('', '');
    var a = fromSoup.find('a');
    var p = toSoup.find('p');

    // a foreign node cannot cycle; use an ancestor inside the target document
    expect(function() { p.insert(0, toSoup.find('div')); }).to.throw();
    expect(function() { p.replaceWith(toSoup.find('div')); }).to.throw();
    // the foreign node must still be fully attached
    expect(function() { toSoup.find('p').insert(0, 42); }).to.throw();

    assert.equal(fromSoup.prettify('', ''), beforeFrom);
    assert.equal(toSoup.prettify('', ''), beforeTo);
    assert.equal(a.parent, fromSoup);
    assertIntegrity(fromSoup);
    assertIntegrity(toSoup);
    done();
  });

  it('rejects replacing a node with its ancestor and leaves the document intact', function(done) {
    var soup = new JSSoup('<div><p id="p1"><b>bold</b></p><p id="p2">p2</p></div>');
    var before = soup.prettify('', '');
    var b = soup.find('b');
    var p1 = soup.find('p', {id: 'p1'});
    var div = soup.find('div');

    expect(function() { b.replaceWith(div); }).to.throw();
    expect(function() { b.replaceWith(p1); }).to.throw();
    expect(function() { b.insert(0, div); }).to.throw();
    expect(function() { p1.replaceWith(div); }).to.throw();
    // the original message for the direct parent is preserved
    expect(function() { p1.replaceWith(div); }).to.throw('Cannot replace element with its parent!');

    assert.equal(soup.prettify('', ''), before);
    assert.equal(b.parent, p1);
    assertIntegrity(soup);
    done();
  });

  it('rejects inserting the document root into one of its descendants', function(done) {
    var soup = new JSSoup('<div><p><b>x</b></p></div>');
    var before = soup.prettify('', '');
    var b = soup.find('b');

    expect(function() { b.insert(0, soup); }).to.throw();
    assert.equal(soup.prettify('', ''), before);
    assert.equal(soup.contents.length, 1);
    assertIntegrity(soup);
    done();
  });

  it('keeps replaceWith atomic when the replacement is invalid', function(done) {
    var soup = new JSSoup('<div><p id="p1">p1</p><p id="p2">p2</p></div>');
    var before = soup.prettify('', '');
    var p1 = soup.find('p', {id: 'p1'});

    expect(function() { p1.replaceWith(null); }).to.throw();
    expect(function() { p1.replaceWith(42); }).to.throw();

    assert.equal(soup.prettify('', ''), before);
    assert.equal(p1.parent, soup.find('div'));
    assertIntegrity(soup);
    done();
  });

  it('moves and replaces string nodes while keeping the traversal chain consistent', function(done) {
    var soup = new JSSoup('<div><p>hello</p><p>world</p></div>');
    var div = soup.find('div');
    var hello = div.contents[0].contents[0];

    // moving an existing string node, inserting new strings and extracting one
    div.insert(1, hello);
    div.insert(2, 'X');
    var inserted = div.contents[2];
    inserted.replaceWith('Y');

    assert.equal(div.prettify('', ''), '<div><p></p>helloY<p>world</p></div>');
    assert.equal(soup.getText(), 'helloYworld');
    assertIntegrity(soup);

    // replaceWith on a string node itself
    var world = soup.find(undefined, undefined, 'world');
    world.replaceWith('earth');
    assert.equal(soup.getText(), 'helloYearth');
    assertIntegrity(soup);
    done();
  });

  it('keeps the tree consistent through a sequence of mixed changes', function(done) {
    var soup = new JSSoup('<div><a>1</a><b>2</b><c>3</c><d>4</d></div>');
    var div = soup.find('div');
    var a = soup.find('a');
    var b = soup.find('b');
    var c = soup.find('c');
    var d = soup.find('d');

    div.insert(100, a);     // move a to the end
    div.insert(0, d);       // move d to the front
    b.extract();            // remove b
    div.insert(1, b);       // put b back in the middle
    c.replaceWith('three'); // replace a tag with a string

    assert.equal(div.prettify('', ''),
      '<div><d>4</d><b>2</b>three<a>1</a></div>');
    assert.equal(soup.getText(), '42three1');
    assert.deepEqual(soup.select('*').map(function(n) { return n.name; }),
      ['div', 'd', 'b', 'a']);
    assertIntegrity(soup);
    done();
  });

  it('supports a full cross-document replaceWith', function(done) {
    var fromSoup = new JSSoup('<div><a>1</a><b>2</b></div>');
    var toSoup = new JSSoup('<section><h1>h</h1><h2>j</h2></section>');
    var h1 = toSoup.find('h1');
    var aTag = fromSoup.find('a');

    h1.replaceWith(aTag);

    assert.equal(fromSoup.prettify('', ''), '<div><b>2</b></div>');
    assert.equal(toSoup.prettify('', ''), '<section><a>1</a><h2>j</h2></section>');
    assertIntegrity(fromSoup);
    assertIntegrity(toSoup);
    done();
  });
});

describe('select', function() {
  it('should select expected elements with combinators', function(done) {
    var soup = new JSSoup(data);
    var b = soup.select("* body span.one.two.three");
    assert.equal(1, b.length);
    assert.equal("One Two Three", b[0].text);
    done()
  });

  it('should select expected elements with mix combinators 2', function(done) {
    var soup = new JSSoup(data);
    var b = soup.select("* body span.one");
    assert.equal(2, b.length);
    assert.equal("One", b[0].text);
    assert.equal("One Two Three", b[1].text);
    done()
  });

  it('should select expected elements with mix selector 2', function(done) {
    var soup = new JSSoup(data);
    var b = soup.select("a.sister#link1");
    assert.equal(1, b.length);
    assert.equal("Elsie", b[0].text);
    done()
  });
});

describe('selectOne', function() {
  it('should select expected elements with combinators', function(done) {
    var soup = new JSSoup(data);
    var b = soup.selectOne("* body span.one");
    assert.equal("One", b.text);
    done()
  });
});
