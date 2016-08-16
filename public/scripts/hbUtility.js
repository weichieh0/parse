
format = function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };

    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
    });

    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString().slice(-v.length);
    });
};

function isEquality(string1, string2) {
    return (string1 == string2);
}

isValueExist = function isValueExist(value) {
    return (new String(value).valueOf() != new String("undefined").valueOf()) && (new String(value).valueOf() != new String("").valueOf());
};


var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


function GroupByKey(items, keyName) {
    var keys = new Array();
    var groups = new Array();
    items.forEach(function (item, index, array) {
        var key = item.get(keyName);
        if (!groups[key.id]) {
            groups[key.id] = new Array();
            keys.push(key);
        }

        groups[key.id].push(item);
    });

    this.groups = groups;
    this.keys = keys;
}

GroupByKey.prototype.keys;
GroupByKey.prototype.groups;
GroupByKey.prototype.getKeys = function () {
    return this.keys;
};

GroupByKey.prototype.getArrayByKey = function (key) {
    return this.groups[key.id];
};

var setShoppingCartFoodTaken = function (shoppingItems, callback) {

    shoppingItems.forEach(function (item, index, array) {
        item.set("foodTaken", true);
    });


    Parse.Object.saveAll(shoppingItems, {
        success: function (objs) {
            // objects have been saved...
            callback(true);
        },
        error: function (error) {
            // an error occurred...
            callback(false);
        }
    });

};

var setShoppingCartCompleted = function (cartId, callback) {

    var HBShoppingCart = Parse.Object.extend("HBShoppingCart");
    var query = new Parse.Query(HBShoppingCart);
    query.include('bee');
    query.get(cartId, {
        success: function (cart) {

            var HBShoppingItem = Parse.Object.extend("HBShoppingItem");
            var itemQuery = new Parse.Query(HBShoppingItem);
            itemQuery.equalTo("shoppingCart", cart);
            itemQuery.find({
                success: function (shoppingItems) {

                    shoppingItems.forEach(function (item, index, array) {
                        item.set("foodTaken", true);
                        item.save();
                        console.log(item.id + " foodTaken: true");
                    });

                    Parse.Cloud.run("updateBeeDeliverStatus", { userId: cart.get("bee").id }, {
                        success: function (result) {
                            console.log(result);
                            if (result) {
                                cart.set("status", "complete");
                                cart.set("completeDate", new Date());
                                cart.save(null, {
                                    success: function (s) {
                                        callback(true, cart);
                                    }, error: function (e) {
                                        console.log(e);
                                        callback(false, null);
                                    }
                                });
                            } else {
                                callback(false, null);
                            }
                        }, error: function (error) {
                            console.log(error);
                            callback(false, null);
                        }
                    });
                },
                error: function (error) {
                    console.log(error);
                    callback(false);
                }
            });
        }, error: function (error) {
            console.log(error);
            callback(false);
        }
    });
};

var getCheckCode = function (id) {

    var length = id.length;
    console.log("length = " + length);

    var n = 0;
    var m = 0;

    for (var i = 0; i < length; i++) {
        n += (i + 1) * id.charCodeAt(i);
        m += (length - i) * id.charCodeAt(i);
    }

    n = n % 100;
    m = m % 100;

    var code = n * 100 + m;
    var codeStr = code.toString();

    for (var i = 0, difLen = (4 - codeStr.length) ; i < difLen; i++) {
        codeStr = "0" + codeStr;
    }

    return codeStr;
};


var covertShoppingCartStatus = function (cart) {
    var status = cart.get("status");
    var beeTakeOff = cart.get("beeTakeoff");
    
    if (!beeTakeOff) {
    	console.log(status);
    	if(isEquality(status, "ongoing")||isEquality(status, "shipping")){
        	return "未出發";
        }
    }

    if (isEquality(status, "complete")) {
        return "完成";
    } else if (isEquality(status, "ongoing")) {
        return "取餐中";
    } else if (isEquality(status, "shipping")) {
        return "送餐中";
    } else if (isEquality(status, "onbid")) {
        return "競標中";
    } else if (isEquality(status, "cancel")) {
        return "取消";
    } else {
        return status;
    }
};

var covertBeeArrivalStatus = function (status) {

    var beeArrival = status != null ? status : "";
    if (beeArrival === "early") {
        beeArrival = "提早";
    } else if (beeArrival === "ontime") {
        beeArrival = "準時";
    } else if (beeArrival === "late") {
        beeArrival = "遲到";
    }

    return beeArrival;
};

var itemNameForDisplayFormat = function (value) {
    if (isValueExist(value)) {
        return "<font color=#888888>" + "  (" + value + ")" + "</font>";
    } else {
        return "";
    }
};

var itemNameForDisplayFormat2 = function (value) {
    if (isValueExist(value)) {
        return "(" + value + ")";
    } else {
        return "";
    }
};

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.latitude - p1.latitude);
  var dLong = rad(p2.longitude - p1.longitude);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
