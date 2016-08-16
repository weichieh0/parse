//
//登入頁相關
//

//取得認證碼
function get_authcode() {
	$.mobile.loading( "show", {});
	var phoneNo = $("#phoneNo").val();
	if (phoneNo == "") {
		$("#phoneNo").css({"border-color": "red",
						   "border-width": "3px",
						   "border-style": "solid"});
		return;
	}
	
	Parse.Cloud.run("getAuthCode", 
		{	
			phoneNo: phoneNo
		}, 
		{
		success: function(result){
			$.mobile.loading( "hide", {});
			$("#phoneNoDisplay").val($("#phoneNo").val());
			$.mobile.changePage("#enterAuthCode");
		},
	 	error: function(error) {
	 		console.log("error:" + error);
		}
	});
}

//登入
function login() {
	$.mobile.loading( "show", {});
	Parse.Cloud.run("login", 
		{	
			phoneNo: $("#phoneNoDisplay").val(),
			authCode: $("#authCode").val() 
		}, 
		{
		success: function(result){
			$.mobile.loading( "hide", {});
			console.log("result:" + result);
			if(result == 200){
				$('#loginError200').popup('open');
			} else {
				//cache user
				Parse.User.become(result).then(function (user) {
				  	console.log("user cached");
				  	logined = true;
				  	$.mobile.changePage("#mainPage");
				  	//navTo("food-court.html");
				}, function (error) {
				  	console.log("user cached error");
				});
			}
		},
	 	error: function(error) {
	 		console.log("error:" + error);
		}
	});
}

/**********************************************************************/
/************************* page event *********************************/
/**********************************************************************/



$(document).on("click", "#authCodeBtn", function(event) {
	get_authcode();
	return false;
});	

$(document).on("click", "#loginBtn", function(event) {
	console.log("loginBtn onclick");
	login();
	return false;
});	



