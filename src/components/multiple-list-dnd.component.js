import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { randomAtoZ, lookUpWord } from "../util";

const HAND_SIZE = 7;

const LETTER_VALUES = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Move item from one list to other
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 10;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  background: isDragging ? "lightgreen" : "grey",
  border: "2px solid black",

  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 500,
  height: 80,
  display: "flex",
  flexDirection: "row",
});

const MultipleDragList = ({ hand }) => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);

  const getItems = (count) => {
    const newItems = Array.from(items);
    for (let i = 1; i <= count; i++) {
      if (newItems.find((item) => item.id === `item-${i}`) === undefined) {
        newItems.push({
          id: `item-${i}`,
          content: randomAtoZ(),
        });
      }
    }
    setItems(newItems);
  };

  useEffect(() => {
    getItems(HAND_SIZE);
  }, [items.length + selected.length]);

  // Defining unique ID for multiple lists
  const id2List = {
    droppable: items,
    droppable2: selected,
  };

  const getList = (id) => id2List[id];

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // Sorting in same list
    if (source.droppableId === destination.droppableId) {
      const newItems = reorder(
        getList(source.droppableId),
        source.index,
        destination.index
      );

      if (source.droppableId === "droppable2") {
        setSelected(newItems);
      } else {
        setItems(newItems);
      }
    }
    // Interlist movement
    else {
      const result = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
      );

      setItems(result.droppable);
      setSelected(result.droppable2);
    }
  };

  const submitWord = async () => {
    const letters = selected.map((item) => item["content"]);
    let sum = letters.reduce((acc, letter) => acc + LETTER_VALUES[letter], 0);
    const word = letters.join("");
    const result = await lookUpWord(word);
    if (result !== undefined) {
      setSelected([]);
      setScore(score + sum);
    }
    console.log(word);
    console.log(result);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="score">{score}</div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {item.content}
                      {LETTER_VALUES[item.content]}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId="droppable2" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {selected.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={submitWord}> clickity </button>
    </div>
  );
};

export default MultipleDragList;
