angular.module 'recipeApp', ['ionic']

.factory 'db', ->
  db = {}
  
  categories = [
    * name: 'Recipe List', data: [
        { name: 'My Recipes', mark: 'ion-heart', fn: 'Recipe List', col: 'assertive', category: 'Recipe List' }
        { name: 'Dessert Ideas', fn: 'Recipe List', mark: 'ion-record', category: 'Recipe List' }
        ]
    * name: 'Shopping List', data: [
        { name: 'Current List', mark: 'ion-ios7-star', fn: 'Shopping List', col: 'calm', category: 'Shopping List' }
        ]
  ]

  db.current = categories[1].data[0]
  db.user = {}
  db.user.convert = true

  db.getData = ->
    return categories
  db.pushData = (i) ->
    for x, index in categories
      if x.name == i.category
        x.data.push(i)
  db.setCurrent = ->
    db.current = it
    return 
  db.getCurrent = ->
    tmp = db.current
    for x in categories
      if x.name == tmp.category
        for y in x.data
          if y.name == tmp.name
            return y
  db.exists = (e) ->
    for x in categories
      for _x in x.data
        if _x.name == e
          return true
    return false
  db.getUser = ->
    return db.user

  return db

# Configuration
.config ($stateProvider, $urlRouterProvider) ->
  $stateProvider
  .state 'index', 
    url: '/'
    templateUrl: 'home.html'
    controller: 'homeCtrl'
  .state 'recipes',
    url: '/recipes'
    templateUrl: 'recipes.html'
    controller: 'recipesCtrl'
  .state 'newItem',
    url: '/newItem'
    templateUrl: 'newItem.html'
    controller: 'newItemCtrl'
  .state 'shoppingList',
    url: '/shoppingList'
    templateUrl: 'shoppingList.html'
    controller: 'shoppingListCtrl'

  $urlRouterProvider.otherwise("/")
  return


homeCtrl = ($scope, $state, db, $rootScope) ->
  db.setCurrent ''
  $rootScope.$emit('resetFooter', '')

  $scope.cats = db.getData()
  $scope.curCat = ''
  $scope.toShow = ''
  $scope.addNew = ->
    $state.go 'newItem'
  $scope.handleClick = (e) ->
    db.current = e
    switch e.fn
      case 'Recipe List'
        $state.go 'recipes'
      case 'Shopping List'
        $state.go 'shoppingList'
  # handle reordering
  $scope.moveItem = (item, c, fromIndex, toIndex) ->
    console.log "from: #fromIndex to: #toIndex, category: ", c

    for x, i in $scope.cats
      if x.name == c
        ionic.Utils.arrayMove $scope.cats[i].data, fromIndex, toIndex
        return



    # $scope..splice(tIndex, 0, $scope.userItems.splice(fIndex, 1)[0])
    #console.log tmp

    #db.update $scope.userItems
    # reload state
    #$state.go($state.current, {}, {reload: true})
  $scope.toggle = ->
    $scope.showReorder = !$scope.showReorder



recipesCtrl = ($scope, $state, db, $ionicPopup, $ionicModal) ->
  $scope.user = db.getUser!
  $scope.data = db.getCurrent!
  $scope.current = {}
  if !$scope.data.items
    $scope.data.items = [
      * name: 'French Fries', category: 'Appetizers'
      * name: 'Lamb Chops', category: 'Entrees'
      * name: 'Lemon Merange Pie', category: 'Desserts'
    ]
    $scope.data.categories = ['Appetizers', 'Entrees', 'Desserts']

  displayError = (title, error) ->
    errorStr = "<center><b>#error</b> <br> "
    errorPopup = $ionicPopup.alert(
      title: "<b class='assertive'>#title</b>"
      template: errorStr + "</center>"
      )
    return

  $scope.newItem = ->
    $scope.item = {}
    $scope.item.title = "New #it recipe"
    $scope.item.category = it
    popup = $ionicPopup.show {
      scope: $scope
      templateUrl: 'newRecipeItem.html'
      buttons: [
        * text: 'Cancel'
        * text: 'Add', type: 'button-positive',
          onTap: (e) ->
            if !$scope.item.name
              e.preventDefault!
              displayError 'Error!', 'Please enter something.'
            else
              $scope.data.items.push $scope.item
      ]
    }

  $scope.newCategory = ->
    $scope.item = {}
    $scope.item.title = "New Category"
    $scope.item.category = it
    popup = $ionicPopup.show {
      scope: $scope
      templateUrl: 'newRecipeItem.html'
      buttons: [
        * text: 'Cancel'
        * text: 'Add', type: 'button-positive',
          onTap: (e) ->
            if !$scope.item.name
              e.preventDefault!
              displayError 'Error!', 'Please enter something.'
            else
              $scope.data.categories.push $scope.item.name
            
      ]
    }

  $ionicModal.fromTemplateUrl 'recipeModal.html', ((modal) ->
    $scope.modal = modal
    return
  ),
    animation: 'slide-in-right'

  $scope.handleImport = ->
    isNum = (n) ->
      !isNaN(parseFloat(n)) && isFinite(n)

    findType = ->
      d = 
        'tsp': <[teaspoon teaspoons tsp]>
        'tbsp': <[tablespoon tablespoons tbsp]>
        'mL': <[ml millilitres milliliter millilitre]>
        'cups': <[cups]>
        'cup': <[cup]>
        'oz': <[oz ounces ounce]>
        'lbs': <[lbs lb pounds pound]>
      #identify type
      for _key, _vals of d
        for _t in _vals
          re = new RegExp "\\b#{_t}\\b"
          if it.search(re) >= 0
            return [ _key, _t ]
      return [ null, null ]

    d2 =
      '1/2': '.5'
      '1/3': '.33'
      '1/4': '.25'
      '3/4': '.75'
      '½': '.5'
      '¼': '.25'
      '¾': '.75'
      '⅓': '.33'



    # split by newline
    resStr = it.split "\n"
    console.log 'we got ', resStr
    # loop through
    for subStr in resStr
      if subStr.length <= 0
        continue
      info = ''
      # brackets detection
      if subStr.indexOf('(') isnt -1
        _left = subStr.indexOf '('
        _right = subStr.indexOf ')'
        info = subStr.slice _left, _right + 1
        subStr = subStr.replace info, ''


      item = {}
      subStr = subStr.toLowerCase!.trim!
      tmp = findType(subStr)
      item.type = tmp[0]

      #found a type, lets get value and name
      if item.type
        toSplit = tmp[1]
        newStr = subStr.split toSplit
        item.qty = newStr[0].trim!
        item.name = newStr[1].trim!
        # Get rid of any non digits
        for _n in item.qty
          if !isNum _n
            item.qty.replace _n, ''
      else
        # no type, split on first whitespace
        i = subStr.indexOf ' '
        if i isnt -1
          newStr = [subStr.slice(0, i), subStr.slice(i+1)]
          item.qty = if isNum(newStr[0]) then newStr[0] else ''
          item.name = newStr[1]
        else # No qty
          item.name = subStr
      # Check for measurements
      tmpQty = ''
      if item.qty
        for _k, _v of d2
          if item.qty.indexOf(_k) isnt -1
            tmpQty = item.qty.replace _k, _v
      # Add to items
      if item.type
        console.log "smart: #{item.qty} #{item.type}"
        _qty = tmpQty || item.qty
        item.smartConvert = calculateSmart _qty, item.type
      # if info
      if info
        item.name += " #info"
      # if 'of'
      if item.name.split(' ')[0] == 'of'
        item.name = item.name.replace('of ', '')
      if !$scope.current.ingredients
        $scope.current.ingredients = []
      $scope.current.ingredients.push item


  $scope.showRecipe = ->
    $scope.current = it
    if !$scope.current.smartConvert
      $scope.current.smartConvert = true
    $scope.modal.current = $scope.current

    $scope.modal.add = (_cat) ->
      $scope.item = {}
      $scope.item.type = 'oz'
      $scope.cat = [['tsp', 'tbsp', 'mL'], ['cups', 'oz', 'lbs']]
      templateToUse = | _cat is 'ingredient' => 'shoppingListPopup.html'
      | _cat is 'instruction' => 'instructionPopup.html'
      popup = $ionicPopup.show(
        scope: $scope
        templateUrl: templateToUse
        buttons: [
          * text: 'Cancel'
          * text: 'Add', type: 'button-positive',
            onTap: (e) ->
              if !$scope.item.name
                displayError 'Error!', 'Please enter an item name.'
                e.preventDefault!
              else
                if $scope.item.type and $scope.item.qty
                  $scope.item.smartConvert = calculateSmart $scope.item.qty, $scope.item.type
                if _cat == 'ingredient'
                  if !$scope.current.ingredients
                    $scope.current.ingredients = []
                  $scope.current.ingredients.push $scope.item
                else if _cat == 'instruction'
                  if !$scope.current.instructions
                    $scope.current.instructions = []
                  $scope.current.instructions.push $scope.item

                $scope.modal.current = $scope.current
        ]
      )

    $scope.modal.import = ->
      $scope.import = {}
      $scope.importPop = $ionicPopup.show (
        scope: $scope
        templateUrl: 'importShoppingList.html'
        buttons: [
          * text: 'Cancel'
          * text: 'Import', type: 'button-positive'
            onTap: (e) ->
              if !$scope.import.str
                e.preventDefault!
              else
                $scope.handleImport $scope.import.str

        ]

      )

    $scope.modal.smartToggle = ->
      $scope.current.smartConvert = !$scope.current.smartConvert
      $scope.modal.current = $scope.current

    $scope.modal.handleClick = ->
      it.strike = !it.strike

    $scope.modal.show!


  $scope.setActive = ->
    if $scope.item.type == it
      $scope.item.type := ''
    else
      $scope.item.type := it

  

newItemCtrl = ($scope, $state, db, $ionicPopup) ->
  $scope.showReorder = false
  $scope.showDelete = false


  $scope.colors = ['positive', 'calm', 'balanced', 'assertive', 'dark']
  $scope.icons = ['ion-ios7-star', 'ion-bag', 'ion-heart', 'ion-pin', 'ion-record', 'ion-ios7-wineglass']
  $scope.categories = ["Recipe List", "Shopping List"]

  $scope.colselected = 4
  $scope.iconselected = 4

  $scope.showForm = true
  $scope.list = {}
  $scope.list.col = 'dark'
  $scope.list.mark = 'ion-record'
  $scope.list.category = $scope.list.fn

  $scope.submit = ->
    # console.log $scope.list
    if !$scope.list.name
      popup = $ionicPopup.alert {
        title: "Error!"
        template: "<center>Please check your list details.</center>"
      }
      return
    else
      tmpName = $scope.list.name
      while db.exists(tmpName)
        tmpName += " +"
      $scope.list.name = tmpName
      $scope.list.fn = $scope.list.category
      db.pushData($scope.list)
      $state.go 'index'

  $scope.exitOut = ->
    $state.go 'index'

  $scope.colselect = (i, c) ->
    $scope.colselected = i
    $scope.list.col = c
  $scope.iconselect = (i, icon) ->
    $scope.iconselected = i
    $scope.list.mark = icon


shoppingListCtrl = ($scope, $state, db, $ionicPopup, $rootScope) ->
  # set reference
  $scope.data = db.getCurrent()
  if !$scope.data.items
    $scope.data.items = []
    $scope.data.convert = true
    $scope.data.sorting = false



  $scope.newItem = ->
    $scope.item = {}
    $scope.item.type = 'oz'
    $scope.cat = [['tsp', 'tbsp', 'mL'], ['cups', 'oz', 'lbs']]

    popup = $ionicPopup.show(
      scope: $scope
      templateUrl: 'shoppingListPopup.html'
      buttons: [
        * text: 'Cancel'
        * text: 'Add', type: 'button-positive',
          onTap: (e) ->
            if !$scope.item.name
              e.preventDefault!
              $scope.showError!
            else
              if !$scope.item.qty
                $scope.item.type = ''
              if $scope.item.type
                $scope.item.smartConvert = calculateSmart $scope.item.qty, $scope.item.type
              $scope.data.items.push $scope.item
      ]
    )

  $scope.handleImport = ->
    isNum = (n) ->
      !isNaN(parseFloat(n)) && isFinite(n)

    findType = ->
      d = 
        'tsp': <[teaspoon teaspoons tsp]>
        'tbsp': <[tablespoon tablespoons tbsp]>
        'mL': <[ml millilitres milliliter millilitre]>
        'cups': <[cups]>
        'cup': <[cup]>
        'oz': <[oz ounces ounce]>
        'lbs': <[lbs lb pounds pound]>
      #identify type
      for _key, _vals of d
        for _t in _vals
          re = new RegExp "\\b#{_t}\\b"
          if it.search(re) >= 0
            return [ _key, _t ]
      return [ null, null ]

    d2 =
      '1/2': '.5'
      '1/3': '.33'
      '1/4': '.25'
      '3/4': '.75'
      '½': '.5'
      '¼': '.25'
      '¾': '.75'
      '⅓': '.33'



    # split by newline
    resStr = it.split "\n"
    console.log 'we got ', resStr
    # loop through
    for subStr in resStr
      if subStr.length <= 0
        continue
      info = ''
      # brackets detection
      if subStr.indexOf('(') isnt -1
        _left = subStr.indexOf '('
        _right = subStr.indexOf ')'
        info = subStr.slice _left, _right + 1
        subStr = subStr.replace info, ''


      item = {}
      subStr = subStr.toLowerCase!.trim!
      tmp = findType(subStr)
      item.type = tmp[0]

      #found a type, lets get value and name
      if item.type
        toSplit = tmp[1]
        newStr = subStr.split toSplit
        item.qty = newStr[0].trim!
        item.name = newStr[1].trim!
        # Get rid of any non digits
        for _n in item.qty
          if !isNum _n
            item.qty.replace _n, ''
      else
        # no type, split on first whitespace
        i = subStr.indexOf ' '
        if i isnt -1
          newStr = [subStr.slice(0, i), subStr.slice(i+1)]
          item.qty = if isNum(newStr[0]) then newStr[0] else ''
          item.name = newStr[1]
        else # No qty
          item.name = subStr
      # Check for measurements
      tmpQty = ''
      if item.qty
        for _k, _v of d2
          if item.qty.indexOf(_k) isnt -1
            tmpQty = item.qty.replace _k, _v
      # Add to items
      if item.type
        console.log "smart: #{item.qty} #{item.type}"
        _qty = tmpQty || item.qty
        item.smartConvert = calculateSmart _qty, item.type
      # if info
      if info
        item.name += " #info"
      # if 'of'
      if item.name.split(' ')[0] == 'of'
        item.name = item.name.replace('of ', '')
      $scope.data.items.push item





  
  $scope.showImport = ->
    if $scope.importPop
      $scope.importPop.close!
    $scope.import = {}

    $scope.importPop = $ionicPopup.show (
      scope: $scope
      templateUrl: 'importShoppingList.html'
      buttons: [
        * text: 'Cancel'
        * text: 'Import', type: 'button-positive'
          onTap: (e) ->
            if !$scope.import.str
              e.preventDefault!
              $scope.showError2!
            else
              $scope.handleImport $scope.import.str


      ]

    )


  $scope.showError = ->
    errorStr = "<center><b>Please recheck your item details.</b> <br> "
    if !$scope.item.name
      errorStr += " You need an item name. <br>"
    errorPopup = $ionicPopup.alert(
      title: "<b class='assertive'>Error!</b>"
      template: errorStr + "</center>"
      )
  $scope.showError2 = ->
    errorPopup2 = $ionicPopup.alert(
      title: "<b class='assertive'>Error!</b>"
      template: "You need to input something in the text box."
      )

  $scope.setActive = ->
    if $scope.item.type == it
      $scope.item.type := ''
    else
      $scope.item.type := it

  $scope.toggleConvert = ->
    $scope.data.convert = !$scope.data.convert

  $scope.toggleSort = ->
    if $scope.data.sorting
      $scope.data.sorting = false
    else
      $scope.data.sorting = 'strike'
  $scope.clearAll = ->
    confirmPopup = $ionicPopup.confirm(
      title: "<b class='assertive'>Trash</b>"
      template: "<center>Delete all items?</center>"
      cancelText: "<b class='assertive'>Cancel</b>"
      okText: "<b class='balanced'>OK</b>"
    )
    confirmPopup.then (res) ->
      if res # Delete all items
        $scope.data.items = []


shoppingListModalCtrl = ($scope, $state, db) ->

  $scope.data = 'hello'

recipeModalCtrl = ($scope, $state, db) ->
  $scope.user = db.getUser!
  console.log $scope.user
  return

calculateSmart = (qty, type) ->
  md = md2 = end = end2 = ''
  switch type
  | 'tsp' => md = 4.92892; end = 'mL'; md2 = 0.333333; end2 = "tbsp"
  | 'tbsp' => md = 14.7868; end = 'mL'; md2 = 0.0625; end2 = 'cups'
  | 'mL' => md = 0.00422675; end = 'cups'; md2 = 0.202884; end2 = 'tsp'
  | 'oz' => md = 28.3495; end = 'grams'; md2 = 29.5735; end2 = "mL"
  | 'cups' => md = 236.588; end = 'mL'; md2 = 8; end2 = 'oz'
  | 'cup' => md = 236.588; end = 'mL'; md2 = 8; end2 = 'oz'
  | 'lbs' => md = 453.592; end = 'grams'; md2 = 2; end2 = 'cups'
  md *= qty; md2 *= qty
  return "#{+md.toFixed(1)} #end or #{+md2.toFixed(1)} #end2"

