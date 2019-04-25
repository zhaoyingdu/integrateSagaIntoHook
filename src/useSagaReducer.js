import { stdChannel, runSaga } from "redux-saga";
import { useReducer, useEffect, useState, useRef } from "react";
import _ from "lodash";
import { call } from "redux-saga/effects";

export function selectAll(selector, args, state) {
  //selector(getAllState, ...args)
  return selector(state, ...args);
}
export function putToAll() {}
const createIO = ({ state, dispatch, sharedChannel, id }) => {
  const channel = stdChannel();
  let stateRef = state;
  /**
   * reference to the newest store[0]
   * according to this post {@link https://overreacted.io/a-complete-guide-to-useeffect/} about react mental model,
   */
  const update = state => {
    stateRef = state;
  };
  return {
    id,
    update,
    channel,
    dispatch,
    getState() {
      return state.current;
    },
    effectMiddlewares: [
      runEffect => effect => {
        if (effect.type === "CALL" && effect.payload.fn.name === "selectAll") {
          const allState = sharedChannel.getAllState();
          const selector = effect.payload.args[0];
          const args = _.drop(effect.payload.args);
          runEffect(call(selectAll, selector, args, allState));
        } else if (
          effect.type === "CALL" &&
          effect.payload.fn.name === "putToAll"
        ) {
          const action = effect.payload.args[0];
          return runEffect(call(sharedChannel.broadcast, action));
        }
        return runEffect(effect);
      }
    ]
  };
};

export const sharedChannel = () => {
  const IOs = [];
  const addIO = IO => IOs.push(IO);
  const broadcast = action => {
    _.forEach(IOs, IO => IO.dispatch(action));
  };
  const getAllState = () => {
    let merged = {};
    _.forEach(IOs, IO => {
      _.assign(merged, IO.getState());
    });
    return merged;
  };
  const remove = id => _.remove(IOs, IO => IO.id === id);
  return {
    addIO,
    getAllState,
    broadcast,
    remove
  };
};

export const useSagaReducer = (
  reducer,
  initState,
  saga,
  sharedChannel = null
) => {
  const [state, dispatch] = useReducer(reducer, initState);
  const stateRef = useRef(state);
  const [action, setAction] = useState({ type: null });
  const patchedDispatch = action => {
    const result = dispatch(action);
    setAction(action);
    return result;
  };
  const [IO, setIO] = useState(
    createIO({
      state: stateRef,
      dispatch: patchedDispatch,
      sharedChannel,
      id: _.uniqueId()
    })
  );

  useEffect(() => {
    sharedChannel ? sharedChannel.addIO(IO) : _.noop();
    const mainTask = runSaga(IO, saga);
    return () => {
      sharedChannel ? sharedChannel.remove(IO.id) : _.noop();
      mainTask.cancel();
    };
  }, []);

  useEffect(() => {
    stateRef.current = state; //update stateRef's mutable field to latest state
  });
  useEffect(() => {
    if (IO) {
      IO.channel.put(action);
      // need to put it here, not in patcheddispatch, otherwise the call after yield tale would
      // not get the newest state, instead would be the last one, because a new render
      // has not happen. also has the potential to block the callstack if
      // saga invokes a long sync call
    }
  }, [action]);
  return [state, patchedDispatch];
};
