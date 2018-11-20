var xhttp;
var keyboardMap;

var AUTOFIRE=0;
var INTERVALVAR;

function jsonCallback(response)
{
	$('select').empty();
	$.each(response, function(gpio, data) 
	{
		$('select').append( $('<option></option>').val(gpio).html(gpio+' (pin '+ data.name+')'));
	});
	
	// Set the selected option based on localstorage
	$.each($('select'), function(val, selectObj) 
	{
		var id=$(selectObj).attr('id');
		var value = localStorage.getItem(id);
		if (value) $(selectObj).val(value);
	});
}

$( document ).ready(function() 
{
	initKeyboardMap();
	xhttp = new XMLHttpRequest();
	
	drawTriangle('canvasleft');
	drawRightTriangle('canvasright');
	drawUpTriangle('canvasup');
	drawDownTriangle('canvasdown');
	drawCircle();

	document.onkeydown = khandle
	document.onkeyup = khandle
	document.onkeypress = khandle
	
	$('#connBtn').click(function () 
	{
		ip=$('#kinput').val();
		$.ajax({type: "GET",
			crossDomain : true,
			url: "http://"+ip+"/listPins",
			dataType: "jsonp",
			jsonp: "jsonp",
			jsonpCallback:"jsonCallback",
			timeout: 3000
		}).done(function () {localStorage.setItem('connBtn',$('#kinput').val());alert('Connection succeded');}).fail(function () {alert('Error');}); 
		
	});
	
	//$('input[type=button]').click(function () 
	$('#keyboardFireBtn,#keyboardLeftBtn,#keyboardRightBtn,#keyboardUpBtn,#keyboardDownBtn,#keyboardAutoFireBtn').click(function ()
	{
		$('input[type=button]').attr('lastPressed',false);
		$(this).attr('lastPressed',true);
		var buttonId=$(this).attr('id');
		$('.modal-content').find('p').html('Press a new key for '+$('label[for='+buttonId+']').text());
		document.getElementById('myModal').style.display = "block";
		$(document).keyup(setChangeKeyHandler);
	});
	
	// Set the selected option based on localstorage
	$.each($('select'), function(val, selectObj) 
	{
		var id=$(selectObj).attr('id');
		var value = localStorage.getItem(id);
		if (value) $(selectObj).val(value);
	});
	
	// Set the key buttons based on localstorage
	$.each($('#keyboardFireBtn,#keyboardLeftBtn,#keyboardRightBtn,#keyboardUpBtn,#keyboardDownBtn,#keyboardAutoFireBtn' ), function(val, selectObj)
	{
		var id=$(selectObj).attr('id');
		var value = localStorage.getItem(id);
		if (value)
		{
			$(selectObj).attr('keyCode',value);
			$(selectObj).attr('value',keyboardMap[value]);
		}
	});
	
	// Set the connection from local storage
	var value = localStorage.getItem('connBtn');
	if (value)
	{
		$('#kinput').val(value);
	}
	
	// Force select to lose focus after selection
	$("select").change(function() 
	{
		localStorage.setItem($(this).attr('id'), $(this).val());
		$(this).blur();
	});

	var slider = document.getElementById("keyboardAutoFireBtnRange");
	var output = document.getElementById("output");
	output.innerHTML = slider.value; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
    	output.innerHTML = this.value;
	}
});

function khandle(e) 
{
	e = e || event
	var evt = e.type
	if ( e.keyCode==$('#keyboardFireBtn').attr('keyCode') )
	{
		handleCommand(evt,$('#firecanvas'),$('#pinfuoco'));
	}
	if ( e.keyCode==$('#keyboardLeftBtn').attr('keyCode') )
	 {
		handleCommand(evt,$('#canvasleft'),$('#pinleft'));
	 }
	if ( e.keyCode==$('#keyboardRightBtn').attr('keyCode') )
	{
		handleCommand(evt,$('#canvasright'),$('#pinright'));
	}
	if ( e.keyCode==$('#keyboardUpBtn').attr('keyCode') )
	{
		handleCommand(evt,$('#canvasup'),$('#pinup'));
	}
	if ( e.keyCode==$('#keyboardDownBtn').attr('keyCode') )
	{
		handleCommand(evt,$('#canvasdown'),$('#pindown'));
	}
	if ( e.keyCode==$('#keyboardAutoFireBtn').attr('keyCode') )
	{
		if (evt.startsWith("keydown"))
		{
			if (AUTOFIRE==0)
			{
				var autofireRate=$("#keyboardAutoFireBtnRange").val()*1;
				console.log("Autofire ON at "+autofireRate);
				INTERVALVAR=setInterval(function(){ 
					handleCommand('keydown',$('#firecanvas'),$('#pinfuoco')); 
					
					sleep(autofireRate/2).then(() => {
						handleCommand('keyup',$('#firecanvas'),$('#pinfuoco'));					
					}); 
				}, autofireRate);
				handleCommand(evt,$('#firecanvas'),$('#pinfuoco'));		
				AUTOFIRE=1;			
			}
			
		}
		else 
		{			
			clearInterval(INTERVALVAR);
			AUTOFIRE=0;		
			console.log("Autofire OFF");					
		}
	}
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function handleCommand(evt,canvas,selectBox)
{
	ip=$('#kinput').val();
	pin=$(selectBox).val();
	id=$(selectBox).attr('id');
	flagvariable=$(selectBox).attr('active');
	if (evt.startsWith("keydown") && flagvariable==0)
	{
		$(selectBox).attr('active',1);
		xhttp.open("GET", "http://"+ip+"/"+pin+"/on", true);
		xhttp.send();
		handleTriangleColor($(canvas).attr('id'),true);
		console.log($('label[for="'+ id +'"]').text()+" pressed");
	}
	else if (evt.startsWith("keyup"))
	{
		 xhttp.open("GET", "http://"+ip+"/"+pin+"/off", true);
  		 xhttp.send();
  		 $(selectBox).attr('active',0);
  		 handleTriangleColor($(canvas).attr('id'),false);
  		 console.log($('label[for="'+ id +'"]').text()+" released");
	}
}

function drawUpTriangle(elem) 
{
	var canvas = document.getElementById(elem);
	canvas.width  = 50;
	canvas.height = 50;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(0,50);
		ctx.lineTo(25,0);
		ctx.lineTo(50,50);
		ctx.fill();
	}
}

function drawDownTriangle(elem) 
{
	var canvas = document.getElementById(elem);
	canvas.width  = 50;
	canvas.height = 50;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(50,0);
		ctx.lineTo(25,50);
		ctx.fill();
	}
}

function drawRightTriangle(elem) {
  var canvas = document.getElementById(elem);
  canvas.width  = 50;
  canvas.height = 50;
  if (canvas.getContext)
  {
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(50,25);
    ctx.lineTo(0,50);
    ctx.fill();
	}
}

function drawTriangle(elem)
{
	var canvas = document.getElementById(elem);
	canvas.width  = 50;
	canvas.height = 50;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(0,25);
		ctx.lineTo(50,50);
		ctx.lineTo(50,0);
		ctx.fill();    
	}
}


function drawCircle()
{
	var canvas = document.getElementById('firecanvas');
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var radius = 70;

	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = '#000000';
	context.fill();
	context.lineWidth = 5;
	context.strokeStyle = '#003300';
	context.stroke();
}


function handleTriangleColor(elem,active)
{
	var c=document.getElementById(elem);
	var ctx=c.getContext("2d");
	if (active)
		ctx.fillStyle="#FF0000";
	else
		ctx.fillStyle="#000000";
	ctx.fill();
}

function setChangeKeyHandler(e)
{
	var buttonObj=$('input[type=button][lastPressed=true]');
	$(buttonObj).attr('value',keyboardMap[e.keyCode]);
	$(buttonObj).attr('keyCode',e.keyCode);
	$(buttonObj).blur();
	localStorage.setItem($(buttonObj).attr('id'),e.keyCode);
	$(document).prop('keyup',null).off('keyup');
	document.getElementById('myModal').style.display = "none";
}


function initKeyboardMap()
{
   keyboardMap = [
  "", // [0]
  "", // [1]
  "", // [2]
  "CANCEL", // [3]
  "", // [4]
  "", // [5]
  "HELP", // [6]
  "", // [7]
  "BACK_SPACE", // [8]
  "TAB", // [9]
  "", // [10]
  "", // [11]
  "CLEAR", // [12]
  "ENTER", // [13]
  "ENTER_SPECIAL", // [14]
  "", // [15]
  "SHIFT", // [16]
  "CONTROL", // [17]
  "ALT", // [18]
  "PAUSE", // [19]
  "CAPS_LOCK", // [20]
  "KANA", // [21]
  "EISU", // [22]
  "JUNJA", // [23]
  "FINAL", // [24]
  "HANJA", // [25]
  "", // [26]
  "ESCAPE", // [27]
  "CONVERT", // [28]
  "NONCONVERT", // [29]
  "ACCEPT", // [30]
  "MODECHANGE", // [31]
  "SPACE", // [32]
  "PAGE_UP", // [33]
  "PAGE_DOWN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SELECT", // [41]
  "PRINT", // [42]
  "EXECUTE", // [43]
  "PRINTSCREEN", // [44]
  "INSERT", // [45]
  "DELETE", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  "COLON", // [58]
  "SEMICOLON", // [59]
  "LESS_THAN", // [60]
  "EQUALS", // [61]
  "GREATER_THAN", // [62]
  "QUESTION_MARK", // [63]
  "AT", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "CONTEXT_MENU", // [93]
  "", // [94]
  "SLEEP", // [95]
  "NUMPAD0", // [96]
  "NUMPAD1", // [97]
  "NUMPAD2", // [98]
  "NUMPAD3", // [99]
  "NUMPAD4", // [100]
  "NUMPAD5", // [101]
  "NUMPAD6", // [102]
  "NUMPAD7", // [103]
  "NUMPAD8", // [104]
  "NUMPAD9", // [105]
  "MULTIPLY", // [106]
  "ADD", // [107]
  "SEPARATOR", // [108]
  "SUBTRACT", // [109]
  "DECIMAL", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "F13", // [124]
  "F14", // [125]
  "F15", // [126]
  "F16", // [127]
  "F17", // [128]
  "F18", // [129]
  "F19", // [130]
  "F20", // [131]
  "F21", // [132]
  "F22", // [133]
  "F23", // [134]
  "F24", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "WIN_OEM_FJ_JISHO", // [146]
  "WIN_OEM_FJ_MASSHOU", // [147]
  "WIN_OEM_FJ_TOUROKU", // [148]
  "WIN_OEM_FJ_LOYA", // [149]
  "WIN_OEM_FJ_ROYA", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "EXCLAMATION", // [161]
  "DOUBLE_QUOTE", // [162]
  "HASH", // [163]
  "DOLLAR", // [164]
  "PERCENT", // [165]
  "AMPERSAND", // [166]
  "UNDERSCORE", // [167]
  "OPEN_PAREN", // [168]
  "CLOSE_PAREN", // [169]
  "ASTERISK", // [170]
  "PLUS", // [171]
  "PIPE", // [172]
  "HYPHEN_MINUS", // [173]
  "OPEN_CURLY_BRACKET", // [174]
  "CLOSE_CURLY_BRACKET", // [175]
  "TILDE", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  "SEMICOLON", // [186]
  "EQUALS", // [187]
  "COMMA", // [188]
  "MINUS", // [189]
  "PERIOD", // [190]
  "SLASH", // [191]
  "BACK_QUOTE", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "OPEN_BRACKET", // [219]
  "BACK_SLASH", // [220]
  "CLOSE_BRACKET", // [221]
  "QUOTE", // [222]
  "", // [223]
  "META", // [224]
  "ALTGR", // [225]
  "", // [226]
  "WIN_ICO_HELP", // [227]
  "WIN_ICO_00", // [228]
  "", // [229]
  "WIN_ICO_CLEAR", // [230]
  "", // [231]
  "", // [232]
  "WIN_OEM_RESET", // [233]
  "WIN_OEM_JUMP", // [234]
  "WIN_OEM_PA1", // [235]
  "WIN_OEM_PA2", // [236]
  "WIN_OEM_PA3", // [237]
  "WIN_OEM_WSCTRL", // [238]
  "WIN_OEM_CUSEL", // [239]
  "WIN_OEM_ATTN", // [240]
  "WIN_OEM_FINISH", // [241]
  "WIN_OEM_COPY", // [242]
  "WIN_OEM_AUTO", // [243]
  "WIN_OEM_ENLW", // [244]
  "WIN_OEM_BACKTAB", // [245]
  "ATTN", // [246]
  "CRSEL", // [247]
  "EXSEL", // [248]
  "EREOF", // [249]
  "PLAY", // [250]
  "ZOOM", // [251]
  "", // [252]
  "PA1", // [253]
  "WIN_OEM_CLEAR", // [254]
  "" // [255]
];
}

