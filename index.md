# Integrate Redux-saga into React hooks - Iteration logs

## Iteration 1
**key words:** monkeyPatch, redux middlewares' concept  
**links:** [reduxMiddleware#monkeypatch](https://redux.js.org/advanced/middleware#attempt-3-monkeypatching-dispatch)  
**note:**  
  *overview:* idea comes from redux's official site "middleware section", redux use middleware to utilize the phase between action is fired(* like when user invoked a dispatch function) and is dispatched(* the action is captured by the reducer). middlewares are "functions" that can intercept this phase, access the action object and do something about it, like logging out the action to console.  
  *implementation:*  
  ![component and action flow](./assets/monkeyPatchStore.png)  
  see also: comments in [CounterItr1](https://github.com/zhaoyingdu/integrateSagaIntoHook/blob/master/src/CounterItr1.js) [SagaItr1](https://github.com/zhaoyingdu/integrateSagaIntoHook/blob/master/src/sagaItr1.js) 
