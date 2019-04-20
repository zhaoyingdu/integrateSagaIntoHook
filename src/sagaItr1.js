import {stdChannel, runSaga} from 'redux-saga'
import {take, put, cancel, fork} from 'redux-saga/effects'
import {EventEmitter} from 'events'

//const emitter = new EventEmitter()
const channel = stdChannel()
//emitter.on('action', channel.put)


/** create an example saga that when enabled will duplicate action effect.
 * (i.e. increment by 2, decrement by 2). when disabled, will change back to 
 * original effect, i.e increment by 1/ decrement by 1
 */
const duplicateEffect = function*(){
  while(true){
    console.log('taking')
    const action = yield take(['INCREMENT','DECREMENT'])//there moght be an infinite loop
    console.log(action)
    yield put(action) // trigger dispatch function on the  IO object of the saga middle ware
  }
}
export const exampleSaga = function*(){
  while(true){ 
    yield take('ENABLE_SAGA')
    const doDupTask = yield fork(duplicateEffect)
    yield take('DISABLE_SAGA')
    yield cancel(doDupTask)
  }
}


// dispatch = sagaMiddleware({state, dispatch})
export const patchReducerWithSaga = (store) =>{ 
  const state = store[0]
  const dispatch = store[1]
  const IO = {
    channel,
    dispatch: (actionObj)=>{
      dispatch(actionObj) //dispatch to reducer
    },
    getState(){
      return state
    }
  } 
  store[1] = action=>{
    const result = dispatch(action) //result here is state
    console.log(`put to channel ${action}`)
    IO.channel.put(action)  //here we manually incoke channel.put, so the takers 
    // will receive(or finally an action has happened and can be taken) a action
    // and saga can proceed
    return result
  }

  return {
    run: (saga, ...args)=>runSaga(IO, saga, args),
  }
}