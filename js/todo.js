function TodoController($scope) 
{
  if(window.localStorage.getItem('todo'))
  {
        $scope.todos = JSON.parse(window.localStorage.getItem('todo'));
  }
  else
  {
    $scope.todos = [
      {text:'Tomatoes', done:true},
      {text:'Carrots', done:false},
      {text:'Berries - Blue, Rasp, Staw', done:false},
      {text:'Onions', done:false},
      {text:'Asparagus', done:false}];
  }
    
    $('#addButton').button();
    //$('#todoInput').button().addClass('ui-textfield');
    //added some css with cool icons

  $scope.todoText = '';
 
  $scope.addTodo = function() 
  {
  	if ($scope.todoText.trim() !== '') 
    {
    	$scope.todos.push(
    	{
            text:$scope.todoText, 
            done:false
        });
    	$scope.todoText = '';
   }
  };
 
  $scope.remaining = function() 
  {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    window.localStorage.setItem('todo', JSON.stringify($scope.todos));
    return count;
  };
 
  $scope.archive = function() 
  {
    var oldTodos = $scope.todos;
    $scope.todos = [];

    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };
}
