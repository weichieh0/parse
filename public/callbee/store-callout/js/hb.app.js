

function verifyUserLogined() {
	var currentUser = Parse.User.current();
	console.log("currentUser not exist:" + (currentUser == null));
	if(currentUser == null) {
		console.log("go home");
		$.mobile.changePage("#home");
    } else {
    	console.log("go to mainPage");
    	$.mobile.changePage("#mainPage");
    }
}

function loadETA() {
	var dateArray = [];
	var today = new Date();
	var dateObj = {};
	dateObj.dateString = (today.getMonth() + 1) + "/" + today.getDate();
	dateArray.push(dateObj);
	
	for(var i=1 ; i < 3; i++) {
		today.setDate(today.getDate() + 1);
		dateObj = {};
		dateObj.dateString = (today.getMonth() + 1) + "/" + today.getDate();
		dateArray.push(dateObj);
	}
	console.log(dateArray);
	var template = Handlebars.compile($("#etd-list-template").html());
	$("#etdDateString").html(template(dateArray));
	$("#etaDateString").html(template(dateArray));
}

//建立訂單
function createShoppingCart() {
	$.mobile.loading("show", {});
	Parse.Cloud.run("createShoppingCart", 
		{	
			cartType : "personal"
		}, 
		{
		success: function(results) {
			$("#orderNo").html(results.id);
			window.localStorage.setItem('cartId', results.id);
			
			$("#mainForm").css("display", "block");
			$.mobile.loading("hide", {});
		},
	 	error: function(error) {
	 		console.log("error:" + error);
	 		$.mobile.loading( "hide", {});
		}
	});
}

//只取有啟用外送服務的店家
function loadStore() {
	$.mobile.loading("show", {});
	Parse.Cloud.run("getFoodStore", 
		{	
			
		}, 
		{
		success: function(results) {
			
			$("#selectDate").html("");
			$("#selectTimeToday").html("");
			$("#selectTime").html("");
			
			var dateList = results[0];
			var availableSlot = results[1];
			
			var availableSlotToday = results[2];
			
			var template = Handlebars.compile($("#eta-date-template").html());
			var ctx = { "availableDate": dateList};
			$("#selectDate").html(template(ctx));
			
			
			$( "#etaPopup" ).popup( "open" );
		},
	 	error: function(error) {
	 		console.log("error:" + error);
	 		$.mobile.loading( "hide", {});
		}
	});
}

function createAddress(ele, addr, addrNote, lat, lng) {
	$.mobile.loading("show", {});
	Parse.Cloud.run("createUserAddressBook_new", 
		{	
			address : $(addr).val(),
			addressNote : $(addrNote).val()
		}, 
		{
		success: function(results) {			
			$(ele).val(results.id);
			$(lat).val(results.get("geoLocation").latitude);
			$(lng).val(results.get("geoLocation").longitude);
			
			if(ele == "#addressId-1") {
				showMe("#findAddr1-OK");
				hideMe("#findAddr1-Failed");
			} else if (ele == "#addressId-2") {
				showMe("#findAddr2-OK");
				hideMe("#findAddr2-Failed");
			} else if (ele == "#addressId-3") {
				showMe("#findAddr3-OK");
				hideMe("#findAddr3-Failed");
			}
			
			$.mobile.loading("hide", {});
		},
	 	error: function(error) {
	 		console.log("error:" + error);
	 		
	 		if(ele == "#addressId-1") {
				showMe("#findAddr1-Failed");
				hideMe("#findAddr1-OK");
			} else if (ele == "#addressId-2") {
				showMe("#findAddr2-Failed");
				hideMe("#findAddr2-OK");
			} else if (ele == "#addressId-3") {
				showMe("#findAddr3-Failed");
				hideMe("#findAddr3-OK");
			}
			
	 		$.mobile.loading( "hide", {});
		}
	});
}

function showMe(item) {
	$(item).css("display", "block");
}
function hideMe(item) {
	$(item).css("display", "none");
}

function createCalloutOrder() {
	$.mobile.loading("show", {});
	
	console.log($("#ownerId").val());
	console.log($("#ETD").val());
	console.log($("#ETA").val());
	console.log($("#orderNo").html());
	console.log($("input[name=reserved]:checked").val());
	$('#transactionResultPopup').popup('open');
	
	Parse.Cloud.run("callBee", 
		{	
			cartId : 		$("#orderNo").html(),
			storeId : 		$("#storeId").val(),
			mealId : 		$("#mealId").val(),
			ownerId : 		$("#ownerId").val(),
			totalPrice: 	$("#totalPrice").val(),
			payToBee:		$("#payToBee").val(),
			reserved:		$("input[name=reserved]:checked").val(),
			beeId:			$("#beeId").val(),
			etaDateString:  $("#etaDateString option:selected").val(),
			etaTimeString: 	$("#etaTimeString").val(),
			etdDateString:	$("#etdDateString option:selected").val(),
			etdTimeString:	$("#etdTimeString").val(),
			sendToId : 		$("#addressId-1").val(),
			address1: 		$("#address1").val(),
			lat1:			$("#lat-1").val(),
			lng1:			$("#lng-1").val(),
			addressNote1: 	$("#addressNote1").val(),
			contact1: 		$("#contact1").val(),
			contactPhone1: 	$("#contactPhone1").val(),
			cash1:			$("#cash1").val(),
			address2: 		$("#address2").val(),
			lat2:			$("#lat-2").val(),
			lng2:			$("#lng-2").val(),
			addressNote2: 	$("#addressNote2").val(),
			contact2: 		$("#contact2").val(),
			contactPhone2: 	$("#contactPhone2").val(),
			cash2:			$("#cash2").val(),
			address3: 		$("#address3").val(),
			lat3:			$("#lat-3").val(),
			lng3:			$("#lng-3").val(),
			addressNote3: 	$("#addressNote3").val(),
			contact3: 		$("#contact3").val(),
			contactPhone3: 	$("#contactPhone3").val(),
			cash3:			$("#cash3").val(),
			storeName:		$("#selectStore option:selected").text()
		}, 
		{
		success: function(results) {
			$("#submitResult").html(results);
			$('#transactionResultPopup').popup('open');
			$.mobile.loading("hide", {});
		},
	 	error: function(error) {
	 		console.log("error:" + error);
	 		$.mobile.loading( "hide", {});
		}
	});
	
}

function lookingForBee() {
	Parse.Cloud.run("lookingForBee", 
		{	
			phoneOfBee: $("#phoneOfBee").val()
		}, 
		{
		success: function(results) {
			$("#beeContact").html(results.get("contact"));
			$("#findBeeOK").css("display", "block");
			$("#findBeeFailed").css("display", "none");
			$("#beeId").val(results.id);
			$.mobile.loading("hide", {});
		},
	 	error: function(error) {
	 		$("#findBeeFailed").css("display", "block");
	 		$("#findBeeOK").css("display", "none");
	 		$("#beeId").val("");
	 		$.mobile.loading( "hide", {});
		}
	});
}

/**********************************************************************/
/************************* page event *********************************/
/**********************************************************************/

//新增外送單
$(document).on("pageshow", "#mainPage" ,function (event) {
	//loadStore();
	loadETA();
});

//新增外送單
$(document).on("click", "#createNew" ,function (event) {
	createShoppingCart();
});

//新增地址
$(document).on("click", "#createAddress1" ,function (event) {
	createAddress("#addressId-1", "#address1", "#addressNote1", "#lat-1", "#lng-1");
});
$(document).on("click", "#createAddress2" ,function (event) {
	createAddress("#addressId-2", "#address2", "#addressNote2", "#lat-2", "#lng-2");
});
$(document).on("click", "#createAddress3" ,function (event) {
	createAddress("#addressId-3", "#address3", "#addressNote3", "#lat-3", "#lng-3");
});

//選店家
$(document).on("change", "#selectStore" ,function (event) {
	var storeId = $("#selectStore option:selected").attr("storeId");
	var mealId = $("#selectStore option:selected").attr("mealId");
	var ownerId = $("#selectStore option:selected").attr("ownerId");
	
	$("#storeId").val(storeId);
	$("#mealId").val(mealId);
	$("#ownerId").val(ownerId);
	
	console.log("storeId:" + storeId + ",mealId:" + mealId);
});

//新增外送單
$(document).on("click", "#submitCreateForm" ,function (event) {
	createCalloutOrder();
});

$(document).on("click", "#confirmResult" ,function (event) {
	$('#transactionResultPopup').popup('close');
	//$.mobile.changePage("#mainPage");
});

//查詢小蜜蜂
$(document).on("click", "#lookingForBee" ,function (event) {
	lookingForBee();
});