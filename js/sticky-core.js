var StickyApp = (function () {'use strict';

	//Constants
	var DEFAULT_TEXT = 'Hello, world! This is a note.';
	var DEFAULT_TITLE = 'Untitled Note';
	var DEFAULT_STARTER_TEXT = 'Welcome! Click the plus button in the upper-right corner to create a new note.';
	var selectedTile, captured, topZ, ordering, tiles, workspace, sidebar, toggleView, newnote, derp, selTile;

	topZ = 0;
	ordering = [
		['sorted', 'relative'],
		['free', 'absolute']
	];
	tiles = [];

	function Tile(tileType) {
		var self = this;
		if (self instanceof Tile) {
			self.tile = document.createElement('li');
			self.tileBody = document.createElement('pre');
			self.closeButton = document.createElement('div');
			self.handle = document.createElement('div');
			self.tile.className = 'tile';
			self.tileBody.className = 'body ' + tileType;
			self.closeButton.className = 'btn-close';
			self.closeButton.innerHTML = '&#10005;';
			self.handle.className = 'handle';
			self.id = (Math.uuid(8));
			self.title = DEFAULT_TITLE;
			self.text = DEFAULT_TEXT;
			self.tile.id = self.id;
			self.tile.appendChild(self.tileBody);
			self.tile.appendChild(self.closeButton);
			self.tile.appendChild(self.handle);
			self.zIndex = ++topZ;
			if (!('mouseDownHandler' in self)) {
				self.mouseDownHandler = function(e) { return self.onMouseDown(e) };
			}
			var mouseDownHandler
			self.tile.addEventListener('mousedown', self.mouseDownHandler, false);
			self.left = Math.round((Math.random() * (window.innerWidth / 2)));
			self.top = Math.round((Math.random() * (window.innerHeight / 2)));
			self.tile.style.position = 'absolute';
			return self;
		} else {
			return new Tile();
		}
	}

	Tile.prototype = {
		get id() { return this._id; },
		set id(x) { this._id = x; },
		get title() { return this._title;},
		set title(x) { this._title = x; },
		get text() { return this._text; },
		set text(x) {
			this.tileBody.innerText = x;
			this._text = x;
		},
		get left() { return this._left; },
		set left(x) {
			var val = x + 'px';
			this.tile.style.left = val;
			this._left = x;
		},
		get top () { return this._top; },
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
			return this._zIndex;
		},
		set zIndex (x) { 
			this.tile.style.zIndex = x; 
			this._zIndex = x;
		},

		onMouseDown : function (e) {
			if (ordering[0][0] === 'free') {
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
		}

	}

	function saveTiles() {
		var str;
		var d = "_µµ_";
		for(var i = 0; i < tiles.length; i++) {

			str = tiles[i].id + d + tiles[i].title + d + tiles[i].text + d + tiles[i].left + d + tiles[i].top + d + tiles[i].zIndex;

			localStorage.setItem('tile_' + i, str);
			console.log(localStorage.getItem('tile_' + i));
		}

	}

	function selectTile(el) {

		if(el.className.indexOf('tile') > -1) {
			var thisTile = getTile(el);
			deselectTile();
			var txtSidebarText = document.getElementById('note_text');
			txtSidebarText.value = thisTile.text;
			var txtSidebarTitle = document.getElementById('title');
			txtSidebarTitle.value = thisTile.title;
			if(thisTile.tile.className.indexOf('sel') === -1) {
				thisTile.tile.className += ' sel';
				thisTile.zIndex = topZ++;
			}

			txtSidebarText.focus();
			return thisTile;
		}
	}

	function deselectTile() {
		var s = document.getElementsByClassName('sel');
		var str;
		for(var i = 0; i < s.length; i++) {
			str = s[i].className;
			s[i].className = str.substring(0, str.indexOf('sel')) + str.substring(str.indexOf('sel') + 3);
		}

		document.getElementById('title').value = 'Sticky Notes';
		document.getElementById('note_text').value = DEFAULT_STARTER_TEXT;
		saveTiles();
	}

	function onClick(e) {
		captured = e.target;
		if (captured.className.indexOf('body') > -1) {
			selectedTile = selectTile(captured.parentNode);
		} else if (captured.id === 'view') {
			changeOrder();
			captured.className = ordering[1][0];
		} else if (captured.className === 'btn-close') {
			removeTile(captured.parentNode);
		} else if (captured.id === 'new_note') {
			var newTile = addNewTile('note');
			selectedTile = selectTile(newTile.tile);
			setPosition();
		} else if (captured.id === 'note_save') {
		} else if (captured.id === 'container') {
			deselectTile();
		}
	}

	function onKey(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.id === 'note_text') {
			switch (k) {
				
			}
			selectedTile.text = captured.value;
		}

		if (captured.id === 'title') {
			selectedTile.title = captured.value;
		}
	}

	function addNewTile (tileType) {
		tiles.push(new Tile(tileType));
		workspace.appendChild(tiles[tiles.length - 1].tile);
		return tiles[tiles.length - 1];
	}

	function removeTile (thisTile) {
		deselectTile();
		if (thisTile.className.indexOf('tile') > -1) {
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
		window.addEventListener('click', function (e) { return onClick(e) }, true);

		sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('keyup', function (e) { return onKey(e) }, false);
		changeOrder(ordering);
		$(workspace).sortable({'items': '.tile', 'placeholder': 'placeholder', 'revert': '140ms', 'tolerance': 'pointer', 'zIndex': '2000'}).sortable('disable');
		toggleView = document.getElementById('view');
		toggleView.addEventListener('click', function(e) {return onClick(e) }, false);

		changeOrder();
	}

	init();

})();