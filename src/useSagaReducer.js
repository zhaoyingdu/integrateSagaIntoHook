
import {stdChannel} from 'redux-saga'
import {useReducer, useEffect, useState, useRef} from 'react'
import _ from 'lodash'
import {runSaga } from 'redux-saga'
import {call } from 'redux-saga/effects'
import {EventEmitter} from 'events'
let id = 0

export function selectAll(selector, args, state){ //selector(getAllState, ...args)
  return selector(state, ...args)
}


const createIO = (store, sharedChannel, id)=>{
  const channel = stdChannel()
  let storeRef = store
  const refreshStore = store=>storeRef = store
  return  {
    id,
    refreshStore,
    channel,
    dispatch: (actionObj)=>{
      sharedChannel? sharedChannel.emitter.emit('new put', actionObj): _.noop()
      storeRef[1](actionObj)
    },
    getState(){
      return storeRef[0]
    },
    effectMiddlewares: [runEffect=>effect=>{
      console.log(effect.type)
      // selector(getState(), ...args)
      if(effect.type === 'SELECT' && sharedChannel){
        runEffect(effect)
        /**
         * although select effect return state from this IO's embedded reducer,
         * trying to alter the baviour of select by selecting from all
         * connected reducer is skeptical, thus, leaving select as is.
         */
      } else if(effect.type==='CALL' && effect.payload.fn.name === 'selectAll'){
        console.log(effect.payload.fn.name)
        const allState = sharedChannel.getState()
        const selector = effect.payload.args[0]
        const args = _.drop(effect.payload.args)
        runEffect(call(selectAll, selector, args, allState))
      }else {
        runEffect(effect)
      }
    }],
  } 
}



export const sharedChannel = ()=>{
  const stores = []
  const emitter = new EventEmitter()
  const addIO = ({store, IO, id})=>{
    stores.push({store, IO, id})
  }
  // refresh store on each re-render, [purpose is to syncing dispatch function,] 
  // edit: purpose is to syncing state
  // same applies to createIO
  const refreshStore = ({store, id})=>{
    _.find(stores, {id: id}).store = store
  }
  const broadcast = (actionObj)=>{
    stores.forEach(({store})=>{
      store[1](actionObj)
    })
  }
  const remove = (id)=>_.remove(stores, store=>store.id === id)
  const getState = ()=>{
    let merged = {}
    _.forEach(stores, ({store})=>{
      _.assign(merged, store[0])
    })
    return merged
  }
  emitter.on('new put', broadcast)

  return {
    emitter,
    addIO,
    getState,
    refreshStore,
    broadcast,
    remove
  }
}



export const useSagaReducer = (reducer, initState,saga, sharedChannel=null)=>{
  const store = useReducer(reducer, initState)
 // const [action, setAction] = useState(null)  dropped, reasoning below
  const [IO, setIO] = useState(null)
  const dispatch = action=>{
      const result = store[1](action) 
      IO.channel.put(action) 
      //setAction(action)
      return result
  }
  
  useEffect(()=>{
    id++
    const IO = createIO(store, sharedChannel, id)
    setIO(IO)
    sharedChannel.addIO({store, id ,IO})
    const mainTask = runSaga(IO, saga)
    return ()=>{
      sharedChannel? sharedChannel.remove(IO.id): _.noop()
      mainTask.cancel()
    }
  },[])

  // dropping this effect, because mental model like this
  // first mount, IO=null, useeffect(set(IO))->triggers render
  // nextrender, IO is set, and accessible in dispatch function
  /*useEffect(()=>{
    if(action !== null){
      IO.channel.put(action) // captured by yield take()
    }
  }, [action])*/
  useEffect(()=>{
    if(IO){
      IO.refreshStore(store)  // refresh store in IO
      sharedChannel.refreshStore({store, id: IO.id}) // refresh store in shared channel
    }
  })
  return [store[0], dispatch]
}