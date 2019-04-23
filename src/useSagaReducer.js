
import {stdChannel} from 'redux-saga'
import {useReducer, useEffect, useState} from 'react'
import _ from 'lodash'
import {runSaga } from 'redux-saga'

/**
 * When called, returns a "channel" object that can be used as argument to run saga.
 * use case: created inside useSagaReducer, then called by runSaga to create a 
 *  collaborating saga for the reducer.
 * @param {Array} store the return value of a call to useReducer
 * @param {Object} sharedChannel an Object returned by sharedChannel(), used to collaborate saga-reducers
 * @param {String|Integer} id An unique Id assigned to an IO, used to remove corresponding reference inside
 *  sharedChannel
 */
const createIO = (store, sharedChannel, id)=>{
  const channel = stdChannel() 
  // redux-saga buffer, push by channel.put, pop by yield take(or channel.take, this methhod not used in this project)
  /**
   * with sharedChannel, this buffer has two source: 1. patched useReducer dspatch 2. sharedChannel.broadcast
   * without sharedChannel, this buffer has only source 1. stated above
   */
  
  let storeRef = store 
  /** 
   * reference to the newest store
   * this ref will be refreshed each time useSagaReducer is invoked,
   * according to Dan abramov's useEffect post about react mental model,
   * each re-render(i.e. componented function get called)
   * its enclosing functions will use variaables enclosed to that frame.
   * since the store argument is the value from onmount, it is neccessary to update
   * it upon each re-render, therefore the states will be updated to the newest value
   * from useReducer.
   * otherwise, call getState() (see below inside return) would always return the
   * state from first useReducer call, because we only stored this value inside
   * useeffect(()=>{...}, []) which is a one time execution after mount
   */
  const refreshStore = store=>storeRef = store
  return  {
    id,
    refreshStore,
    channel,

    /**
     * not to confuse with useReducers' vanilla dispatch. this dispatch
     * function is used by redux saga to resolve a yield put(actionObj) call on the 
     * corresponding channel. (corresponding: IO, saga are corresponding to each other
     * if they are passed as argumen to one runSaga call, means that IO can only be
     * affected by that particular saga function(besides patched useReducer dispatch))
     */
    dispatch: actionObj=>{ // the source of this action is a yield put(actionObj) 
      //call from one of the collaborating saga-reducer, not from useReducer vanilla dispatch
      // therefore, it should first be dispatched, then put to channel. like 
      // what is done to action from useReducer vanilla dispatch
      return sharedChannel
        ? sharedChannel.broadcast(actionObj)
        : ( storeRef[1](actionObj), //actual call to useReducers' vanilla dispatch
            channel.put(actionObj)) 
    },
    getState(){
      return storeRef[0] 
    },
    effectMiddlewares: [],
  } 
}



export const sharedChannel = ()=>{
  const stores = []
  const addIO = ({store,IO, id})=>{
    stores.push({store,IO, id})
  }
  // refresh store on each re-render, purpose is to sync store[0] with new state resulted, 
  // from a re-render, same applies to createIO
  const refreshStore = ({store, id})=>{
    _.find(stores, {id: id}).store = store
  }
  const broadcast = (actionObj)=>{
    stores.forEach(({store,IO})=>{
      store[1](actionObj)
      IO.channel.put(actionObj)
    })
  }
  const remove = (id)=>_.remove(stores, store=>store.id === id)
  return {
    addIO,
    refreshStore,
    broadcast,
    remove
  }
}


export const useSagaReducer = (reducer, initState,saga, sharedChannel=null)=>{
  const store = useReducer(reducer, initState)
  const [IO, setIO] = useState(null)
  const dispatch = action=>{
      const result = store[1](action) 
      IO.channel.put(action)
      return result
  }
  
  useEffect(()=>{
    const id = _.uniqueId()
    const IO = createIO(store, sharedChannel, id)
    setIO(IO)
    sharedChannel.addIO({store,IO, id})
    const mainTask = runSaga(IO, saga)
    return ()=>{
      sharedChannel? sharedChannel.remove(IO.id): _.noop() 
      /**
       * remove {IO, store} reference from sharedChannel's array,
       * nect mount will just store new reference again.
       */
      mainTask.cancel()
    }
  },[])
  
  useEffect(()=>{
    if(IO){
      IO.refreshStore(store)  // refresh store in IO
      sharedChannel.refreshStore({store, id: IO.id}) // refresh store in shared channel
    }
  })
  return [store[0], dispatch]
}