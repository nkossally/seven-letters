import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { randomAtoZ, lookUpWord } from "../util";

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

  return (
        <Droppable droppableId={droppableId} direction="horizontal" >
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
                      className="tile"
                    >
                      <div>{item.content}</div>
                      <div className="letter-val">meow</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
  );
};

export default MultipleDragList;