

function getRandomColor(count) {
var colors = [];
for (var i = 0; i < count; i++) {
   var letters = '0123456789ABCDEF'.split('');
   var color = '#';
      for (var x = 0; x < 6; x++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color);
      }
   return colors;
}

function GetPieData(x_data) {
  if(x_data === null) {
    var data = [{
        values: [],
        labels: [],
        type: 'pie',
    }];

    return data;
  }

  let listOfDicts = new Map();
  let count = 0;
  for (let obj of x_data) {
    if (listOfDicts.has(obj)) {
        count = listOfDicts.get(obj);
        listOfDicts.set(obj, count + 1);
    } else {
        listOfDicts.set(obj, 1);
    }
  }

  const iterator1 = listOfDicts[Symbol.iterator]();
  var labels = [];
  var values = [];

  console.log(listOfDicts)

  for (const item of iterator1) {
    labels.push(item[0]);
    values.push(item[1]);
  }

  var data = [{
    values: values,
    labels: labels,
    type: 'pie',
  }];

  return data;
}

function GetPieLayout(x_label) {
    console.log(x_label)
    var layout = {

      title:'',
      width:500,
	  height:439,
    };

    return layout;
}

export { GetPieData, GetPieLayout };