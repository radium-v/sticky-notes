var StickyApp = (function () {'use strict';

	//Constants
	var DEFAULT_TEXT = 'Hello, world! \nThis is a note. Please write on me, drag me around, or delete me.', captured, topZ, ordering, tiles, workspace, toggleView, controlPanel, derp;

	topZ = 0;
	ordering = [
		['sorted', 'relative'],
		['free', 'absolute']
	];
	tiles = [];

	function Tile(tileType) {
		var self, tile, tileBody, closeButton, handle;
		self = this;
		if (self instanceof Tile) {
			tile = document.createElement('li');
			tileBody = document.createElement('div');
			closeButton = document.createElement('div');
			handle = document.createElement('div');
			tile.className = 'tile';
			tileBody.className = 'body ' + tileType;
			closeButton.className = 'btn-close';
			closeButton.innerHTML = '&#10005;';
			handle.className = 'handle';
			tileBody.setAttribute('contenteditable', 'true');
			self.tile = tile;
			self.id = (Math.uuid(8));
			self.tile.id = self.id;
			tileBody.innerHTML = DEFAULT_TEXT;
			self.tile.appendChild(tileBody);
			self.tile.appendChild(closeButton);
			self.tile.appendChild(handle);
			self.zIndex = ++topZ;
			self.tile.addEventListener('mousedown', function (e) {
				return self.onMouseDown(e);
			}, false);
			self.left = Math.round((Math.random() * (window.innerWidth / 2)));
			self.top = Math.round((Math.random() * (window.innerHeight / 2)));
			self.tile.style.position = 'absolute';
			return self;
		} else {
			return new Tile();
		}
	}

	Tile.prototype = {
		get id() {
			return this._id;
		},
		set id(x) {
			this._id = x;
		},
		get text() {
			return this.tileBody.innerHTML();
		},
		set text(x) {
			this.tileBody.innerHTML = x;
		},
		get left() {
			return this._left;
		},
		set left(x) {
			var val = x + 'px';
			this.tile.style.left = val;
			this._left = x;
		},
		get top () {
			return this._top;
		},
		set top (x) {
			var val = x + 'px';
			this.tile.style.top = val;
			this._top = x;
		},
		get width () {
			this._width = this.tile.scrollWidth;
			return this._width;
		},
		set width (x) {
			this.tile.style.width = x + 'px';
			this._width = x;
		},
		get height () {
			this._height = this.tile.scrollHeight;
			return this._height;
		},
		set height (x) {
			this.tile.style.height = x + 'px';
			this._height = x + 'px';
		},
		get position() {
			this._position = this.tile.style.position;
			return this._position;
		},
		set position(x) {
			this.tile.style.position = x;
			this._position = x;
		},
		get zIndex () { 
			this._zIndex = x;
			return this.tile.style.zIndex;
		},
		set zIndex (x) { 
			this.tile.style.zIndex = x; 
			this._zIndex = x;
		},

		onMouseDown: function (e) {
			if (e.target.className === 'handle' && ordering[0][0] === 'free') {
				captured = this;
				this.startX = e.clientX - this.tile.offsetLeft;
				this.startY = e.clientY - this.tile.offsetTop;
				this.zIndex = ++topZ;
				var self = this;
				if (!('mouseMoveHandler' in this)) {
					this.mouseMoveHandler = function(e) { return self.onMouseMove(e) }
					this.mouseUpHandler = function(e) { return self.onMouseUp(e) }
				}
				document.addEventListener('mousemove', this.mouseMoveHandler, false);
				document.addEventListener('mouseup', this.mouseUpHandler, false);
			}
		},

		onMouseMove : function (e) {
			this.left = e.clientX - this.startX;
			this.top = e.clientY - this.startY;
		},

		onMouseUp : function (e) {
			captured = e.target.parentNode;
			document.removeEventListener('mousemove', this.mouseMoveHandler, false);
			document.removeEventListener('mouseup', this.mouseUpHandler, false);
			console.log('Dropped tile ' + captured.id + 'at x:' + captured.style.left + ', y:' + captured.style.top);
		},

		addShadow : function (e) {
			var shadow = document.createElement('span');
			shadow.setAttribute('class', 'shadow');
			this.tile.appendChild(shadow);
		}
	}

	function focusTile(e) {
		captured = e.target.parentNode;
		if(captured.className.indexOf('tile') > -1) {
			var thisTile = getTile(captured);
			if (!('focusHandler' in thisTile)) {
				thisTile.focusHandler = function(e) {
					return thisTile.addShadow(e);
				}
			}
			thisTile.tile.addEventListener('webkitAnimationEnd', thisTile.focusHandler, true);
		}
	}

	function blurTile(e) {
		captured = e.target.parentNode;
		var thisTile = getTile(captured);
		var shadow = document.getElementsByClassName('shadow');
		for (var i = 0; i < shadow.length; i++) {
			shadow[i].parentNode.removeChild(shadow[i]);
		}
		if ('focusHandler' in thisTile) {
			thisTile.tile.removeEventListener('webkitAnimationEnd', thisTile.focusHandler, true);
		}
	}

	function onClick(e) {
		captured = e.target;
		if (captured.className.indexOf('body') > -1) {
			captured.parentNode.style.zIndex = topZ++;
		} else if (captured.id === 'view') {
			changeOrder();
			captured.className = ordering[1][0];
		} else if (captured.className === 'btn-close') {
			removeTile(captured.parentNode);
		} else if (captured.id === 'new_note') {
			var newTile = addNewTile('note');
			setPosition();
			console.log('Created Note ' + newTile.id);
		} else if (captured.id === 'new_list') {
			console.log('Added a new list');
		}
	}

	function onHotKey(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.className.indexOf('body') > -1) {
			if (k === 27) {
				e.preventDefault;
				if (window.confirm('Are you sure you would like to delete this sticky?')) {
					var t = captured.parentNode;
					removeTile(t);
				}
				return false;
			}
		}
	}

	function addNewTile (tileType) {
		tiles.push(new Tile(tileType));
		workspace.appendChild(tiles[tiles.length - 1].tile);
		tiles[tiles.length - 1].tile.childNodes[0].focus();
		return tiles[tiles.length - 1];
	}

	function removeTile (thisTile) {
		if (thisTile.className === 'tile') {
			if (thisTile.nextSibling) {
				thisTile.nextSibling.childNodes[0].focus();
			} else if (thisTile.previousSibling) {
				thisTile.previousSibling.childNodes[0].focus();
			}
			workspace.removeChild(thisTile);
			for (var i = 0; i < tiles.length; i++) {
				if (tiles[i].tile === thisTile) {
					tiles.splice(i, 1);
				}
			}
		}
	}

	function changeOrder() {
		ordering.push(ordering.shift());
		setPosition();
		if (ordering[0][0] === 'sorted') {
			$(workspace).sortable('enable');
		} else {
			$(workspace).sortable('disable');
		}
	}

	function setPosition() {
		for (var i = 0; i < tiles.length; i++) {
			tiles[i].position = ordering[0][1];
			if (ordering[0][0] === 'sorted') {
				tiles[i].tile.style.left = 'inherit';
				tiles[i].tile.style.top = 'inherit';
			} else {
				tiles[i].left = tiles[i].left;
				tiles[i].top = tiles[i].top;
			}
		}		
	}

	function getTile(el) {
		for (var i = 0; i < tiles.length; i++) {
			if (el === tiles[i].tile) {
				return tiles[i];
			}
		}
	}

	function init() {
		workspace = document.getElementById('stickies');
		workspace.addEventListener('click', function (e) { return onClick(e) }, false);
		// workspace.addEventListener('keyup', function (e) { return onHotKey(e) }, false);
		workspace.addEventListener('focus', function (e) {return focusTile(e) }, true);
		workspace.addEventListener('blur', function (e) {return blurTile(e) }, true);
		changeOrder(ordering);
		$(workspace).sortable({'items': '.tile', 'handle': '.handle', 'placeholder': 'placeholder', 'revert': '140ms', 'tolerance': 'pointer', 'zIndex': '2000'}).sortable('disable');
		toggleView = document.getElementById('view');
		toggleView.addEventListener('click', function(e) {return onClick(e) }, false);
		controlPanel = document.getElementById('controlpanel');
		controlPanel.addEventListener('click', function(e) {return onClick(e) }, false);
	}

	init();

})();