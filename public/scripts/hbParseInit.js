
Parse.initialize("9O3uQHctMnz86F6m3lifIlwKrMGONwlUjO2OL4uf", "nbkR1HRcOkFEa4J73rPsWvaZsqa6O6BHI0GSGClz");

//test
// Parse.initialize("UWZqpCsyFQWnyLTChFrK6t19NyLtmm7m0W2gP2ul", "GSmSLSAz7FfGyfXXB9wCvtwIJULXPHBFkM2PzwdZ");

var currentUser = Parse.User.current();

if (currentUser == null) {

    console.log("user2 = null");
    alert("user = null");

    window.open("login.html", "_parent", "", true);

    //Parse.User.logOut().then(() => {
    //    var currentUser = Parse.User.current();  // this will now be null
    //});

    //var email = "test@test.com";
    //var password = "test";

    //console.log("inputEmail: " + email);
    //console.log("inputPassword: " + password);

    //Parse.User.logIn(email, password, {
    //    success: function (user) {

    //        var user = Parse.User.current();

    //        if (user == null) {
    //            console.log("user = null");
    //            alert("無此帳號");

    //        } else {
    //            console.log("user id = " + user.id);
    //            var qualify = user.get('qualify');
    //            console.log("user qualify = " + qualify);
    //            alert(user.get('contact') + " 您好!");
    //            window.open("orderManagement.html", "_parent", "", true);
    //        }

    //    },
    //    error: function (user, error) {

    //        console.log("The login failed. Check error to see why.");
    //        alert("The login failed. Check error to see why.");
    //        // The login failed. Check error to see why.
    //    }
    //});

} else {

    currentUser.fetch({
        success: function (user) {
            currentUser = user;
            console.log("user id = " + user.id);
            var isQualify = currentUser.get("qualify");

            if (!isQualify) {
                Parse.User.logOut().then(() => {
                    console.log("logOut");
                    var currentUser = Parse.User.current();  // this will now be null
                    window.open("login.html", "_parent", "", true);
                });
            }

        }, error: function (e) {
            console.log("e = " + e);
        }
    });
}

var parseLogOut = function () {

    Parse.User.logOut().then(() => {
        console.log("logOut");
        var currentUser = Parse.User.current();  // this will now be null
        window.open("login.html", "_parent", "", true);
    });

}
