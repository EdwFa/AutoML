

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

function GetHistogramData(x_data, groups) {

   var groups_styles = new Array();

   if (groups != null) {
    var groups_set = [...new Set(groups)];
    console.log(groups_set);
    var groups_colors = getRandomColor(groups_set.length);

    let i = 0;
    for (let el of groups_set) {
        groups_styles.push({target: el, value: {marker: {color: groups_styles[i]}}})
        i += 1;
     };
   }

    var trace1 = {
      x: x_data,
      mode: 'markers',
      type: 'histogram',
      name: 'Team A',

      marker: { size: 8 },
      transforms: [{
        type: 'groupby',
        groups: groups,
        styles: groups_styles
      }],
    };

    var data = [ trace1 ];

    return data;
}

function GetHistogramLayout(x_label) {
    console.log(x_label)
    var layout = {

      title:'',
      width:500,
	  height:439,
	  xaxis: {title: x_label},
    };

    return layout;
}

export { GetHistogramData, GetHistogramLayout };