var homeCtrl, recipesCtrl, newItemCtrl, shoppingListCtrl, shoppingListModalCtrl, recipeModalCtrl, calculateSmart;
angular.module('recipeApp', ['ionic']).factory('db', function(){
  var db, categories;
  db = {};
  categories = [
    {
      name: 'Recipe List',
      data: [
        {
          name: 'My Recipes',
          mark: 'ion-heart',
          fn: 'Recipe List',
          col: 'assertive',
          category: 'Recipe List'
        }, {
          name: 'Dessert Ideas',
          fn: 'Recipe List',
          mark: 'ion-record',
          category: 'Recipe List'
        }
      ]
    }, {
      name: 'Shopping List',
      data: [{
        name: 'Current List',
        mark: 'ion-ios7-star',
        fn: 'Shopping List',
        col: 'calm',
        category: 'Shopping List'
      }]
    }
  ];
  db.current = categories[1].data[0];
  db.user = {};
  db.user.convert = true;
  db.getData = function(){
    return categories;
  };
  db.pushData = function(i){
    var i$, ref$, len$, index, x, results$ = [];
    for (i$ = 0, len$ = (ref$ = categories).length; i$ < len$; ++i$) {
      index = i$;
      x = ref$[i$];
      if (x.name === i.category) {
        results$.push(x.data.push(i));
      }
    }
    return results$;
  };
  db.setCurrent = function(it){
    db.current = it;
  };
  db.getCurrent = function(){
    var tmp, i$, ref$, len$, x, j$, ref1$, len1$, y;
    tmp = db.current;
    for (i$ = 0, len$ = (ref$ = categories).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (x.name === tmp.category) {
        for (j$ = 0, len1$ = (ref1$ = x.data).length; j$ < len1$; ++j$) {
          y = ref1$[j$];
          if (y.name === tmp.name) {
            return y;
          }
        }
      }
    }
  };
  db.exists = function(e){
    var i$, ref$, len$, x, j$, ref1$, len1$, _x;
    for (i$ = 0, len$ = (ref$ = categories).length; i$ < len$; ++i$) {
      x = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = x.data).length; j$ < len1$; ++j$) {
        _x = ref1$[j$];
        if (_x.name === e) {
          return true;
        }
      }
    }
    return false;
  };
  db.getUser = function(){
    return db.user;
  };
  return db;
}).config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('index', {
    url: '/',
    templateUrl: 'home.html',
    controller: 'homeCtrl'
  }).state('recipes', {
    url: '/recipes',
    templateUrl: 'recipes.html',
    controller: 'recipesCtrl'
  }).state('newItem', {
    url: '/newItem',
    templateUrl: 'newItem.html',
    controller: 'newItemCtrl'
  }).state('shoppingList', {
    url: '/shoppingList',
    templateUrl: 'shoppingList.html',
    controller: 'shoppingListCtrl'
  });
  $urlRouterProvider.otherwise("/");
});
homeCtrl = function($scope, $state, db, $rootScope){
  db.setCurrent('');
  $rootScope.$emit('resetFooter', '');
  $scope.cats = db.getData();
  $scope.curCat = '';
  $scope.toShow = '';
  $scope.addNew = function(){
    return $state.go('newItem');
  };
  $scope.handleClick = function(e){
    db.current = e;
    switch (e.fn) {
    case 'Recipe List':
      return $state.go('recipes');
    case 'Shopping List':
      return $state.go('shoppingList');
    }
  };
  $scope.moveItem = function(item, c, fromIndex, toIndex){
    var i$, ref$, len$, i, x;
    console.log("from: " + fromIndex + " to: " + toIndex + ", category: ", c);
    for (i$ = 0, len$ = (ref$ = $scope.cats).length; i$ < len$; ++i$) {
      i = i$;
      x = ref$[i$];
      if (x.name === c) {
        ionic.Utils.arrayMove($scope.cats[i].data, fromIndex, toIndex);
        return;
      }
    }
  };
  return $scope.toggle = function(){
    return $scope.showReorder = !$scope.showReorder;
  };
};
recipesCtrl = function($scope, $state, db, $ionicPopup, $ionicModal){
  var displayError;
  $scope.user = db.getUser();
  $scope.data = db.getCurrent();
  $scope.current = {};
  if (!$scope.data.items) {
    $scope.data.items = [
      {
        name: 'French Fries',
        category: 'Appetizers'
      }, {
        name: 'Lamb Chops',
        category: 'Entrees'
      }, {
        name: 'Lemon Merange Pie',
        category: 'Desserts'
      }
    ];
    $scope.data.categories = ['Appetizers', 'Entrees', 'Desserts'];
  }
  displayError = function(title, error){
    var errorStr, errorPopup;
    errorStr = "<center><b>" + error + "</b> <br> ";
    errorPopup = $ionicPopup.alert({
      title: "<b class='assertive'>" + title + "</b>",
      template: errorStr + "</center>"
    });
  };
  $scope.newItem = function(it){
    var popup;
    $scope.item = {};
    $scope.item.title = "New " + it + " recipe";
    $scope.item.category = it;
    return popup = $ionicPopup.show({
      scope: $scope,
      templateUrl: 'newRecipeItem.html',
      buttons: [
        {
          text: 'Cancel'
        }, {
          text: 'Add',
          type: 'button-positive',
          onTap: function(e){
            if (!$scope.item.name) {
              e.preventDefault();
              return displayError('Error!', 'Please enter something.');
            } else {
              return $scope.data.items.push($scope.item);
            }
          }
        }
      ]
    });
  };
  $scope.newCategory = function(it){
    var popup;
    $scope.item = {};
    $scope.item.title = "New Category";
    $scope.item.category = it;
    return popup = $ionicPopup.show({
      scope: $scope,
      templateUrl: 'newRecipeItem.html',
      buttons: [
        {
          text: 'Cancel'
        }, {
          text: 'Add',
          type: 'button-positive',
          onTap: function(e){
            if (!$scope.item.name) {
              e.preventDefault();
              return displayError('Error!', 'Please enter something.');
            } else {
              return $scope.data.categories.push($scope.item.name);
            }
          }
        }
      ]
    });
  };
  $ionicModal.fromTemplateUrl('recipeModal.html', function(modal){
    $scope.modal = modal;
  }, {
    animation: 'slide-in-right'
  });
  $scope.handleImport = function(it){
    var isNum, findType, d2, resStr, i$, len$, subStr, info, _left, _right, item, tmp, toSplit, newStr, j$, ref$, len1$, _n, i, tmpQty, _k, _v, _qty, results$ = [];
    isNum = function(n){
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    findType = function(it){
      var d, _key, _vals, i$, len$, _t, re;
      d = {
        'tsp': ['teaspoon', 'teaspoons', 'tsp'],
        'tbsp': ['tablespoon', 'tablespoons', 'tbsp'],
        'mL': ['ml', 'millilitres', 'milliliter', 'millilitre'],
        'cups': ['cups'],
        'cup': ['cup'],
        'oz': ['oz', 'ounces', 'ounce'],
        'lbs': ['lbs', 'lb', 'pounds', 'pound']
      };
      for (_key in d) {
        _vals = d[_key];
        for (i$ = 0, len$ = _vals.length; i$ < len$; ++i$) {
          _t = _vals[i$];
          re = new RegExp("\\b" + _t + "\\b");
          if (it.search(re) >= 0) {
            return [_key, _t];
          }
        }
      }
      return [null, null];
    };
    d2 = {
      '1/2': '.5',
      '1/3': '.33',
      '1/4': '.25',
      '3/4': '.75',
      '½': '.5',
      '¼': '.25',
      '¾': '.75',
      '⅓': '.33'
    };
    resStr = it.split("\n");
    console.log('we got ', resStr);
    for (i$ = 0, len$ = resStr.length; i$ < len$; ++i$) {
      subStr = resStr[i$];
      if (subStr.length <= 0) {
        continue;
      }
      info = '';
      if (subStr.indexOf('(') !== -1) {
        _left = subStr.indexOf('(');
        _right = subStr.indexOf(')');
        info = subStr.slice(_left, _right + 1);
        subStr = subStr.replace(info, '');
      }
      item = {};
      subStr = subStr.toLowerCase().trim();
      tmp = findType(subStr);
      item.type = tmp[0];
      if (item.type) {
        toSplit = tmp[1];
        newStr = subStr.split(toSplit);
        item.qty = newStr[0].trim();
        item.name = newStr[1].trim();
        for (j$ = 0, len1$ = (ref$ = item.qty).length; j$ < len1$; ++j$) {
          _n = ref$[j$];
          if (!isNum(_n)) {
            item.qty.replace(_n, '');
          }
        }
      } else {
        i = subStr.indexOf(' ');
        if (i !== -1) {
          newStr = [subStr.slice(0, i), subStr.slice(i + 1)];
          item.qty = isNum(newStr[0]) ? newStr[0] : '';
          item.name = newStr[1];
        } else {
          item.name = subStr;
        }
      }
      tmpQty = '';
      if (item.qty) {
        for (_k in d2) {
          _v = d2[_k];
          if (item.qty.indexOf(_k) !== -1) {
            tmpQty = item.qty.replace(_k, _v);
          }
        }
      }
      if (item.type) {
        console.log("smart: " + item.qty + " " + item.type);
        _qty = tmpQty || item.qty;
        item.smartConvert = calculateSmart(_qty, item.type);
      }
      if (info) {
        item.name += " " + info;
      }
      if (item.name.split(' ')[0] === 'of') {
        item.name = item.name.replace('of ', '');
      }
      if (!$scope.current.ingredients) {
        $scope.current.ingredients = [];
      }
      results$.push($scope.current.ingredients.push(item));
    }
    return results$;
  };
  $scope.showRecipe = function(it){
    $scope.current = it;
    if (!$scope.current.smartConvert) {
      $scope.current.smartConvert = true;
    }
    $scope.modal.current = $scope.current;
    $scope.modal.add = function(_cat){
      var templateToUse, popup;
      $scope.item = {};
      $scope.item.type = 'oz';
      $scope.cat = [['tsp', 'tbsp', 'mL'], ['cups', 'oz', 'lbs']];
      templateToUse = (function(){
        switch (false) {
        case _cat !== 'ingredient':
          return 'shoppingListPopup.html';
        case _cat !== 'instruction':
          return 'instructionPopup.html';
        }
      }());
      return popup = $ionicPopup.show({
        scope: $scope,
        templateUrl: templateToUse,
        buttons: [
          {
            text: 'Cancel'
          }, {
            text: 'Add',
            type: 'button-positive',
            onTap: function(e){
              if (!$scope.item.name) {
                displayError('Error!', 'Please enter an item name.');
                return e.preventDefault();
              } else {
                if ($scope.item.type && $scope.item.qty) {
                  $scope.item.smartConvert = calculateSmart($scope.item.qty, $scope.item.type);
                }
                if (_cat === 'ingredient') {
                  if (!$scope.current.ingredients) {
                    $scope.current.ingredients = [];
                  }
                  $scope.current.ingredients.push($scope.item);
                } else if (_cat === 'instruction') {
                  if (!$scope.current.instructions) {
                    $scope.current.instructions = [];
                  }
                  $scope.current.instructions.push($scope.item);
                }
                return $scope.modal.current = $scope.current;
              }
            }
          }
        ]
      });
    };
    $scope.modal['import'] = function(){
      $scope['import'] = {};
      return $scope.importPop = $ionicPopup.show({
        scope: $scope,
        templateUrl: 'importShoppingList.html',
        buttons: [
          {
            text: 'Cancel'
          }, {
            text: 'Import',
            type: 'button-positive',
            onTap: function(e){
              if (!$scope['import'].str) {
                return e.preventDefault();
              } else {
                return $scope.handleImport($scope['import'].str);
              }
            }
          }
        ]
      });
    };
    $scope.modal.smartToggle = function(){
      $scope.current.smartConvert = !$scope.current.smartConvert;
      return $scope.modal.current = $scope.current;
    };
    return $scope.modal.show();
  };
  return $scope.setActive = function(it){
    if ($scope.item.type === it) {
      return $scope.item.type = '';
    } else {
      return $scope.item.type = it;
    }
  };
};
newItemCtrl = function($scope, $state, db, $ionicPopup){
  $scope.showReorder = false;
  $scope.showDelete = false;
  $scope.colors = ['positive', 'calm', 'balanced', 'assertive', 'dark'];
  $scope.icons = ['ion-ios7-star', 'ion-bag', 'ion-heart', 'ion-pin', 'ion-record', 'ion-ios7-wineglass'];
  $scope.categories = ["Recipe List", "Shopping List"];
  $scope.colselected = 4;
  $scope.iconselected = 4;
  $scope.showForm = true;
  $scope.list = {};
  $scope.list.col = 'dark';
  $scope.list.mark = 'ion-record';
  $scope.list.category = $scope.list.fn;
  $scope.submit = function(){
    var popup, tmpName;
    if (!$scope.list.name) {
      popup = $ionicPopup.alert({
        title: "Error!",
        template: "<center>Please check your list details.</center>"
      });
    } else {
      tmpName = $scope.list.name;
      while (db.exists(tmpName)) {
        tmpName += " +";
      }
      $scope.list.name = tmpName;
      $scope.list.fn = $scope.list.category;
      db.pushData($scope.list);
      return $state.go('index');
    }
  };
  $scope.exitOut = function(){
    return $state.go('index');
  };
  $scope.colselect = function(i, c){
    $scope.colselected = i;
    return $scope.list.col = c;
  };
  return $scope.iconselect = function(i, icon){
    $scope.iconselected = i;
    return $scope.list.mark = icon;
  };
};
shoppingListCtrl = function($scope, $state, db, $ionicPopup, $rootScope){
  $scope.data = db.getCurrent();
  if (!$scope.data.items) {
    $scope.data.items = [];
    $scope.data.convert = true;
    $scope.data.sorting = false;
  }
  $scope.newItem = function(){
    var popup;
    $scope.item = {};
    $scope.item.type = 'oz';
    $scope.cat = [['tsp', 'tbsp', 'mL'], ['cups', 'oz', 'lbs']];
    return popup = $ionicPopup.show({
      scope: $scope,
      templateUrl: 'shoppingListPopup.html',
      buttons: [
        {
          text: 'Cancel'
        }, {
          text: 'Add',
          type: 'button-positive',
          onTap: function(e){
            if (!$scope.item.name) {
              e.preventDefault();
              return $scope.showError();
            } else {
              if (!$scope.item.qty) {
                $scope.item.type = '';
              }
              if ($scope.item.type) {
                $scope.item.smartConvert = calculateSmart($scope.item.qty, $scope.item.type);
              }
              return $scope.data.items.push($scope.item);
            }
          }
        }
      ]
    });
  };
  $scope.handleImport = function(it){
    var isNum, findType, d2, resStr, i$, len$, subStr, info, _left, _right, item, tmp, toSplit, newStr, j$, ref$, len1$, _n, i, tmpQty, _k, _v, _qty, results$ = [];
    isNum = function(n){
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    findType = function(it){
      var d, _key, _vals, i$, len$, _t, re;
      d = {
        'tsp': ['teaspoon', 'teaspoons', 'tsp'],
        'tbsp': ['tablespoon', 'tablespoons', 'tbsp'],
        'mL': ['ml', 'millilitres', 'milliliter', 'millilitre'],
        'cups': ['cups'],
        'cup': ['cup'],
        'oz': ['oz', 'ounces', 'ounce'],
        'lbs': ['lbs', 'lb', 'pounds', 'pound']
      };
      for (_key in d) {
        _vals = d[_key];
        for (i$ = 0, len$ = _vals.length; i$ < len$; ++i$) {
          _t = _vals[i$];
          re = new RegExp("\\b" + _t + "\\b");
          if (it.search(re) >= 0) {
            return [_key, _t];
          }
        }
      }
      return [null, null];
    };
    d2 = {
      '1/2': '.5',
      '1/3': '.33',
      '1/4': '.25',
      '3/4': '.75',
      '½': '.5',
      '¼': '.25',
      '¾': '.75',
      '⅓': '.33'
    };
    resStr = it.split("\n");
    console.log('we got ', resStr);
    for (i$ = 0, len$ = resStr.length; i$ < len$; ++i$) {
      subStr = resStr[i$];
      if (subStr.length <= 0) {
        continue;
      }
      info = '';
      if (subStr.indexOf('(') !== -1) {
        _left = subStr.indexOf('(');
        _right = subStr.indexOf(')');
        info = subStr.slice(_left, _right + 1);
        subStr = subStr.replace(info, '');
      }
      item = {};
      subStr = subStr.toLowerCase().trim();
      tmp = findType(subStr);
      item.type = tmp[0];
      if (item.type) {
        toSplit = tmp[1];
        newStr = subStr.split(toSplit);
        item.qty = newStr[0].trim();
        item.name = newStr[1].trim();
        for (j$ = 0, len1$ = (ref$ = item.qty).length; j$ < len1$; ++j$) {
          _n = ref$[j$];
          if (!isNum(_n)) {
            item.qty.replace(_n, '');
          }
        }
      } else {
        i = subStr.indexOf(' ');
        if (i !== -1) {
          newStr = [subStr.slice(0, i), subStr.slice(i + 1)];
          item.qty = isNum(newStr[0]) ? newStr[0] : '';
          item.name = newStr[1];
        } else {
          item.name = subStr;
        }
      }
      tmpQty = '';
      if (item.qty) {
        for (_k in d2) {
          _v = d2[_k];
          if (item.qty.indexOf(_k) !== -1) {
            tmpQty = item.qty.replace(_k, _v);
          }
        }
      }
      if (item.type) {
        console.log("smart: " + item.qty + " " + item.type);
        _qty = tmpQty || item.qty;
        item.smartConvert = calculateSmart(_qty, item.type);
      }
      if (info) {
        item.name += " " + info;
      }
      if (item.name.split(' ')[0] === 'of') {
        item.name = item.name.replace('of ', '');
      }
      results$.push($scope.data.items.push(item));
    }
    return results$;
  };
  $scope.showImport = function(){
    if ($scope.importPop) {
      $scope.importPop.close();
    }
    $scope['import'] = {};
    return $scope.importPop = $ionicPopup.show({
      scope: $scope,
      templateUrl: 'importShoppingList.html',
      buttons: [
        {
          text: 'Cancel'
        }, {
          text: 'Import',
          type: 'button-positive',
          onTap: function(e){
            if (!$scope['import'].str) {
              e.preventDefault();
              return $scope.showError2();
            } else {
              return $scope.handleImport($scope['import'].str);
            }
          }
        }
      ]
    });
  };
  $scope.showError = function(){
    var errorStr, errorPopup;
    errorStr = "<center><b>Please recheck your item details.</b> <br> ";
    if (!$scope.item.name) {
      errorStr += " You need an item name. <br>";
    }
    return errorPopup = $ionicPopup.alert({
      title: "<b class='assertive'>Error!</b>",
      template: errorStr + "</center>"
    });
  };
  $scope.showError2 = function(){
    var errorPopup2;
    return errorPopup2 = $ionicPopup.alert({
      title: "<b class='assertive'>Error!</b>",
      template: "You need to input something in the text box."
    });
  };
  $scope.setActive = function(it){
    if ($scope.item.type === it) {
      return $scope.item.type = '';
    } else {
      return $scope.item.type = it;
    }
  };
  $scope.toggleConvert = function(){
    return $scope.data.convert = !$scope.data.convert;
  };
  $scope.toggleSort = function(){
    if ($scope.data.sorting) {
      return $scope.data.sorting = false;
    } else {
      return $scope.data.sorting = 'strike';
    }
  };
  return $scope.clearAll = function(){
    var confirmPopup;
    confirmPopup = $ionicPopup.confirm({
      title: "<b class='assertive'>Trash</b>",
      template: "<center>Delete all items?</center>",
      cancelText: "<b class='assertive'>Cancel</b>",
      okText: "<b class='balanced'>OK</b>"
    });
    return confirmPopup.then(function(res){
      if (res) {
        return $scope.data.items = [];
      }
    });
  };
};
shoppingListModalCtrl = function($scope, $state, db){
  return $scope.data = 'hello';
};
recipeModalCtrl = function($scope, $state, db){
  $scope.user = db.getUser();
  console.log($scope.user);
};
calculateSmart = function(qty, type){
  var md, md2, end, end2;
  md = md2 = end = end2 = '';
  switch (type) {
  case 'tsp':
    md = 4.92892;
    end = 'mL';
    md2 = 0.333333;
    end2 = "tbsp";
    break;
  case 'tbsp':
    md = 14.7868;
    end = 'mL';
    md2 = 0.0625;
    end2 = 'cups';
    break;
  case 'mL':
    md = 0.00422675;
    end = 'cups';
    md2 = 0.202884;
    end2 = 'tsp';
    break;
  case 'oz':
    md = 28.3495;
    end = 'grams';
    md2 = 29.5735;
    end2 = "mL";
    break;
  case 'cups':
    md = 236.588;
    end = 'mL';
    md2 = 8;
    end2 = 'oz';
    break;
  case 'cup':
    md = 236.588;
    end = 'mL';
    md2 = 8;
    end2 = 'oz';
    break;
  case 'lbs':
    md = 453.592;
    end = 'grams';
    md2 = 2;
    end2 = 'cups';
  }
  md *= qty;
  md2 *= qty;
  return (+md.toFixed(1)) + " " + end + " or " + (+md2.toFixed(1)) + " " + end2;
};