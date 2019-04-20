import {stdChannel} from 'redux-saga'
import {take, put, cancel, fork} from 'redux-saga/effects'
import _ from 'lodash'
import {EventEmitter} from 'events'

//const emitter = new EventEmitter()
const channel = stdChannel()
//emitter.on('action', channel.put)

let id =0
/** create an example saga that when enabled will duplicate action effect.
 * (i.e. increment by 2, decrement by 2). when disabled, will change back to 
 * original effect, i.e increment by 1/ decrement by 1
 */
const duplicateEffect = function*(){
  while(true){
    console.log('taking')
    const action = yield take(['INCREMENT','DECREMENT'])//there moght be an infinite loop
    //yield put(action)// trigger dispatch function on the  IO object of the saga middle ware
    if(action.type === 'INCREMENT'){
      yield put({type:'INCREMENTED'})
    }else{
      yield put({type: 'DECREMENTED'})
    }
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

const stores= []
export const IO = {
  channel,
  dispatch: (actionObj)=>{
    _.forEach(stores, keyedStore=>{
      const dispatch = keyedStore.store[1]
      dispatch(actionObj)
    })
    //dispatch(actionObj) //dispatch to reducer
  },
  getState(){
    const states = stores.map(keyedStore=>{
      return keyedStore.store[0]
    })
    const mergedStates = _.assignIn({}, ...states)
    return mergedStates
  }
} 
// dispatch = sagaMiddleware({state, dispatch})
export const patchReducerWithSaga = ({key, store}) =>{  
  _.find(stores, {key:key})? _.noop():stores.push({key, store}) //should we push this store? should if it was not there

  const dispatch = store[1]
  store[1] = action=>{
    const result = dispatch(action) //result here is state
    //console.log(`put to channel ${action}`)
    IO.channel.put(action)  //here we manually incoke channel.put, so the takers 
    // will receive(or finally an action has happened and can be taken) a action
    // and saga can proceed
    return result
  }
}