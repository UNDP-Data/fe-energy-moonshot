// @ts-ignore:next-line
import StackedBarChart from 'stacked-barchart';

// interface BarchartData {
// }

interface Props {
  // data: BarchartData;
}

export default (props: Props) => {
  // const {
  //   data,
  // } = props;

  const graph = StackedBarChart(
      { data: [
        {
          "SIDS": {
            "color":"#AEFFEC",
            "value":15000,
            "order":1
          },
          "LDCS": {
            "color":"#55ECD1",
            "value":10000,
            "order":2,
            "overlap":3000
          },
          "LLDCS": {
            "color":"#00D2E0",
            "value":50000,
            "order":3,
            "overlap":5000
          },
          "Other": {
            "color":"#03C38A",
            "value":20000,
            "order":4
          }
        }
      ]
    },
      {
        containerSelector: "#chart-container"
      }
    );

    // To expand the graph upon node click (ie. to see more connections another hop away)
    // The clicked data object can also be used to extract new information
    // graph.on('nodeClick', (event) => {
    //   const node = event.clickedNodeData
    //   const newNode = data1[node.row][node.key]
    //   newNode.key = node.key
    //   newNode.row = node.row
    //   graph.update(newNode)
    // })

  return (
    <div id='chart-container'>

    </div>
  );
};
