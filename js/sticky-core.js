var StickyApp = (function () {'use strict'

    var DEFAULT_APP_TITLE = '',
        captured,
        DEFAULT_STARTER_TEXT = 'Welcome! Click the plus button in the upper-right corner to create a new note.',
        DEFAULT_TEXT = 'Hello, world! This is a note.',
        DEFAULT_TITLE = 'Untitled Note',
        dueDate = document.getElementById('due_date'),
        isTouchEnabled = window.Touch || false,
        nH,
        nW,
        ordering = [['sorted', 'relative'], ['free', 'absolute']],
        selectedTile,
        sidebar = document.getElementById('sidebar'),
        splash = document.getElementById('splash'),
        tiles = [],
        toggleView,
        topZ = 0,
        txtSidebarText = document.getElementById('textbox'),
        txtSidebarTitle = document.getElementById('title'),
        workspace = document.getElementById('workspace'),

    Tile = function(args) {
        var self = this, key;
        if (this instanceof Tile) {
            self.tile = document.createElement('div');
            self.tileBody = document.createElement('pre');
            self.closeButton = document.createElement('div');
            self.tileBody.className = 'note';
            self.closeButton.className = 'btn-close';
            self.tile.appendChild(self.tileBody);
            self.tile.appendChild(self.closeButton);
            self.tile.className = 'tile';
            self.position = ordering[0][1];

            if (args) {
                for (key in args) {
                    if (args.hasOwnProperty(key)) {
                        self[key] = args[key];
                    }
                }
            } else {
                self.id = (Math.uuid(8));
                self.left = Math.round((Math.random() * (window.innerWidth / 2)));
                self.text = DEFAULT_TEXT;
                self.title = DEFAULT_TITLE;
                self.top = Math.round((Math.random() * (window.innerHeight / 2)));
            }

            self.tilt = 15;
            self.z = ++topZ;


            return self;
        } else {
            return new Tile(arguments);
        }
    };

    Tile.prototype = {
        get date() {
            return this._date;
        },

        set date(value) {
            this._date = value;
        },

        get id() {
            return this._id;
        },

        set id(value) {
            this.tile.id = value;
            this._id = value;
        },

        get title() {
            return this._title;
        },

        set title(value) {
            this._title = value;
        },

        get text() {
            return this._text;
        },

        set text(value) {
            this.tileBody.innerText = value;
            this._text = value;
        },

        get left() {
            return this._left;
        },

        set left(value) {
            this.tile.style.left = value + 'px';
            this._left = value;
        },

        get tilt() {
            return this._tilt;
        },

        set tilt(value) {
            this._tilt = Math.floor(Math.random() * value);
            this._tilt = (Math.floor(Math.random() * 2) === 1) ? -this._tilt : this._tilt;
            this.tile.style.webkitTransform = 'rotate(' + this._tilt + 'deg)';
        },

        get top () {
            return this._top;
        },

        set top(value) {
            this.tile.style.top = value + 'px';
            this._top = value;
        },

        get position() {
            this._position = this.tile.style.position;
            return this._position;
        },

        set position(value) {
            this.tile.style.position = value;
            this._position = value;
        },

        get width() {
            return this.tile.clientWidth;
        },

        set width(value) {
            this.tile.clientWidth = value;
            this._width = value;
        },

        get height() {
            return this.tile.clientHeight;
        },

        set height(value) {
            this.tile.clientHeight = value;
            this._height = value;
        },

        get z() {
            return this._z;
        },

        set z(value) {
            this.tile.style.zIndex = value;
            this._z = value;
        }

    };

    function getTile(el) {
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].tile === el) {
                return tiles[i];
            }
        }
    }

    function saveTiles() {
        var str;
        localStorage.clear();
        for(var i = 0; i < tiles.length; i++) {
            str = {
                'id' : tiles[i].id,
                'date' : (typeof tiles[i].date !== undefined) ? tiles[i].date : '',
                'left' : tiles[i].left,
                'text' : tiles[i].text,
                'tilt' : tiles[i].tilt,
                'title' : tiles[i].title,
                'top' : tiles[i].top,
                'z' : tiles[i].z
            };
            localStorage.setItem('ordering', JSON.stringify(ordering));
            localStorage.setItem('tile_' + i, JSON.stringify(str));
        }
    }

    function deselectTile() {
        var s = document.getElementsByClassName('sel'), str;
        for (var i = s.length - 1; i >= 0; i--) {
            s[i].className = 'tile';
        }
        txtSidebarTitle.value = DEFAULT_APP_TITLE;
        txtSidebarTitle.blur();
        txtSidebarTitle.disabled = true;
        dueDate.disabled = true;
        dueDate.value = ''
        txtSidebarText.innerText = DEFAULT_STARTER_TEXT;
        txtSidebarText.setAttribute('contenteditable', 'false');
    }

    function selectTile(el) {
        if (el.className.indexOf('tile') > -1) {
            deselectTile();
            selectedTile = getTile(el);
            nW = workspace.clientWidth - selectedTile.width;
            nH = workspace.clientHeight - selectedTile.height;
            selectedTile.tile.className = 'tile sel';
            selectedTile.z = topZ++;
            txtSidebarText.innerText = selectedTile.text;
            txtSidebarText.setAttribute('contenteditable', 'true');
            txtSidebarTitle.value = selectedTile.title;
            txtSidebarTitle.disabled = false;
            dueDate.value = (typeof selectedTile.date !== 'undefined') ? selectedTile.date : '';
            dueDate.disabled = false;
            txtSidebarTitle.focus();
            txtSidebarTitle.setSelectionRange(0, txtSidebarTitle.value.length);
        }
    }

    function setPosition() {
        for (var i = tiles.length - 1; i >= 0; i--) {
            tiles[i].position = ordering[0][1];
            if (ordering[0][0] === 'sorted') {
                tiles[i].tile.style.left = '';
                tiles[i].tile.style.top = '';
            } else {
                tiles[i].left = tiles[i].left;
                tiles[i].top = tiles[i].top;
            }
        }

        if (ordering[0][0] === 'sorted') {
            $(workspace).sortable('enable');
        } else {
            $(workspace).sortable('disable');
            enforceBounds();
        }
    }

    function addNewTile (options) {
        selectedTile = new Tile(options);
        tiles.push(selectedTile);
        workspace.appendChild(selectedTile.tile);
        setPosition();
        selectTile(selectedTile.tile);
    }

    function removeTile (thisTile) {
        deselectTile();
        if (thisTile.className.indexOf('tile') > -1) {
            workspace.removeChild(thisTile);
            for (var i = tiles.length - 1; i >= 0; i--) {
                if (tiles[i].tile === thisTile) {
                    tiles.splice(i, 1);
                }
            }
            saveTiles();
        }
    }

    function onMouseMove(e) {
        var nX, nY;
        e.preventDefault();
        if (isTouchEnabled) {
            nX = e.touches[0].clientX - selectedTile.startX;
            nY = e.touches[0].clientY - selectedTile.startY;
            selectedTile.left = (nX >= 0) ? ((nX <= nW) ? nX : nW) : 0;
            selectedTile.top = (nY >= 0) ? ((nY <= nH) ? nY : nH) : 0;
        } else {
            nX = e.clientX - selectedTile.startX;
            nY = e.clientY - selectedTile.startY;
            selectedTile.left = (nX >= 0) ? ((nX <= nW) ? nX : nW) : 0;
            selectedTile.top = (nY >= 0) ? ((nY <= nH) ? nY : nH) : 0;
        }
    }

    function enforceBounds() {
        if (ordering[0][0] === 'free') {
            for (var i = tiles.length - 1; i >= 0; i--) {
                    tiles[i].left = (tiles[i].left < 0) ? 0 : 
                        ((tiles[i].left > (workspace.clientWidth - tiles[i].width)) ? 
                        (workspace.clientWidth - tiles[i].width) : tiles[i].left);
                    tiles[i].top = (tiles[i].top < 0) ? 0 : 
                        ((tiles[i].top > (workspace.clientHeight - tiles[i].height)) ? 
                        (workspace.clientHeight - tiles[i].height) : tiles[i].top);
            } 
        }
    }

    function onMouseUp(e) {
        window.removeEventListener(isTouchEnabled ? 'touchmove' : 'mousemove', this.mouseMoveHandler, false);
        window.removeEventListener(isTouchEnabled ? 'touchend' : 'mouseup', this.mouseUpHandler, false);
        saveTiles();
    }

    function onMouseDown(e) {
        captured = isTouchEnabled ? e.touches[0].target.parentNode : e.target.parentNode;
        if ((ordering[0][0] === 'free') && (captured.className.indexOf('tile') > -1)) {
            selectTile(captured);
            selectedTile.startX = (isTouchEnabled ? e.touches[0].clientX : e.clientX) - selectedTile.tile.offsetLeft;
            selectedTile.startY = (isTouchEnabled ? e.touches[0].clientY : e.clientY) - selectedTile.tile.offsetTop;
            selectedTile.z = ++topZ;
            if (!(selectedTile.hasOwnProperty('mouseMoveHandler'))) {
                selectedTile.mouseMoveHandler = function(e) { return onMouseMove.apply(selectedTile, arguments); };
                selectedTile.mouseUpHandler = function(e) { return onMouseUp.apply(selectedTile, arguments); };
            }

            if(!window.Touch) {
                e.preventDefault();
                window.addEventListener('mousemove', selectedTile.mouseMoveHandler, false);
                window.addEventListener('mouseup', selectedTile.mouseUpHandler, false);
            } else {
                window.addEventListener('touchend', selectedTile.mouseUpHandler, false);
                window.addEventListener('touchmove', selectedTile.mouseUpHandler, false);
            }
        }
    }
    
    function onKeyUp(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;
        var k = e.keyCode;
        if (captured === txtSidebarText && (txtSidebarText.getAttribute('contenteditable') === 'true')) {
            selectedTile.text = txtSidebarText.innerText;
        }

        if (captured === txtSidebarTitle) {
            selectedTile.title = txtSidebarTitle.value;
        }
    }

    function onKeyDown(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;
        var k = e.keyCode;
        switch (k) {
            case 9:
                if (captured === txtSidebarTitle) {
                    if (e.shiftKey) {
                        e.preventDefault();
                        if (selectedTile.tile.previousSibling) {
                            selectTile(selectedTile.tile.previousSibling);
                        } else {
                            selectTile(tiles[tiles.length - 1].tile);
                        }
                    }
                    saveTiles();
                    break;
                }
                
                if (captured === txtSidebarText) {
                    if (!e.shiftKey) {
                        e.preventDefault();
                        if (selectedTile.tile.nextSibling) {
                            selectTile(selectedTile.tile.nextSibling);
                        } else {
                            selectTile(tiles[0].tile);
                        }
                    }
                    saveTiles();
                    break;
                }
                
            default:
        }

    }

    function onClick(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;

        if (captured.className.indexOf('splash') > -1) {
            workspace.parentNode.removeChild(splash);
        }

        if (captured.className.indexOf('note') !== -1) {
            selectTile(captured.parentNode);
        }

        if (captured.id === 'view') {
            ordering.push(ordering.shift());
            setPosition();
            captured.className = 'button view ' + ordering[1][0];
            saveTiles();
        }

        if (captured.className.indexOf('btn-close') > -1) {
            removeTile(captured.parentNode);
            saveTiles();
        }
        
        if (captured.id === 'new_note') {
            addNewTile();
            saveTiles();
        }
        
        if (captured.id === 'note_save') {
            saveTiles();
        }

        if (captured === workspace) {
            deselectTile();
            saveTiles();
        }

    }


    function sortTiles(e, ui) {
        var arr = $(workspace).sortable('toArray'), dummy = [], i;
        for (var i = arr.length - 1; i >= 0; i--) {
            while (tiles[0].tile.id !== arr[i]) {
                tiles.push(tiles.shift());
            }
            dummy.push(tiles.shift());
        }
        tiles = dummy;
        saveTiles();
    }

    function init() {
        
        window.addEventListener('click', function (e) { return onClick(e); }, true);
        window.addEventListener(isTouchEnabled ? 'touchstart' : 'mousedown', function(e) { return onMouseDown(e); }, true);
        window.addEventListener('resize', function(e) { return enforceBounds(); }, false);

        sidebar.addEventListener('keyup', function (e) { return onKeyUp(e); }, false);
        sidebar.addEventListener('keydown', function (e) { return onKeyDown(e); }, false);

            $(workspace).sortable({
                items: '.tile',
                revert: '140ms',
                tolerance: 'pointer',
                zIndex: '2000',
                stop : function(e, ui) {
                    return sortTiles.apply(this, arguments);
                }
            }).sortable('disable');

            $(dueDate).datepicker({
                dateFormat: 'yy-mm-dd',
                minDate: new Date(),
                onSelect: function(dateText) {
                    selectedTile.date = dateText;
                    saveTiles();
                }
            });
        
        if (localStorage.length > 0) {
            
            workspace.parentNode.removeChild(splash);

            for(var i = 0; i < localStorage.length; i++) {
                if(localStorage.hasOwnProperty('tile_' + i)) {
                    addNewTile(JSON.parse(localStorage.getItem('tile_' + i)));
                }
            }
            if (localStorage.hasOwnProperty('ordering')) {
                ordering = JSON.parse(localStorage.getItem('ordering'));
                setPosition();
            }
        } else {
            splash.style.display = 'block';
            splash.childNodes[1].style.left = (window.innerWidth - splash.childNodes[1].clientWidth) / 2 + 'px';
            splash.childNodes[1].style.top = (window.innerHeight - splash.childNodes[1].clientHeight) / 2 + 'px';
        }

        deselectTile();

        /* For Sticky Note Splash */


    }

    init();

}());