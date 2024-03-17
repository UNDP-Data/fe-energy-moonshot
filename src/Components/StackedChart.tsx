import { useEffect, useState } from 'react';
// @ts-ignore:next-line
import StackedBarChart from 'stacked-barchart';

interface Props {
  data: any;
  id: string;
  clickCallback: Funcion;
}

export default (props: Props) => {
  const {
    data,
    id,
    clickCallback
  } = props;

  const [graph, setGraph] = useState()

  useEffect(() => {
    const graph = StackedBarChart(
      {
        data: [
          data,
        ],
      },
      {
        containerSelector: `#${id}`,
        width: document.getElementById(id)?.offsetWidth,
        height: 60,
        margin: { left: 0, top: 0, bottom: 0 },
      },
    );
    setGraph(graph);
    graph.on('nodeClick', (event) => {
      clickCallback(event.clickedNodeData.key)
    })
  }, []);

  // useEffect(() => {
  //   if(graph) {
  //     graph.updateAll(data)
  //   }
  // }, [data])

  return (
    <div id={id} />
  );
};
