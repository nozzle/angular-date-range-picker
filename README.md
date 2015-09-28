# Pure Angular Datepicker, without jQuery

[![Join the chat at https://gitter.im/nozzle/nzDatepicker](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nozzle/nzDatepicker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Install

```
bower install angular-date-range-picker
```


## Usage

```js
// require dateRangePicker module as dependency
angular.module('myApp', ['dateRangePicker']);
```

```js
// specify default date range in controller
$scope.dates = moment().range("2012-11-05", "2013-01-25")
```

```html
<!-- use 'date-range-picker' directive in view -->
<input type="text" date-range-picker ng-model="dates"/>
```

## Customizations

### Simple date picker

You can also select only one date:

```html
<!-- use 'date-range-picker' directive in view -->
<input type="text" date-range-picker ranged="false"/>
```

### Select range options

```js
$scope.rangeSelectOptions = [
  {
    label: "This year",
    range: moment().range(
      moment().startOf("year").startOf("day"),
      moment().endOf("year").startOf("day")
    )
  },
  {
    label: "Last year",
    range: moment().range(
      moment().startOf("year").add(-1, "year").startOf("day"),
      moment().add(-1, "year").endOf("year").startOf("day")
    )
  }
]

```

```html
<input type="text" date-range-picker ng-model="dates" custom-select-options="rangeSelectOptions" />
```

## Angular version compatibility table

Due to usage of `track by $index` it is impossible to provide one version for both angular `< 1.2` and `>= 1.2`.

<table>
  <tr>
    <th>Angular version</th>
    <th>date-range-picker version</th>
  </tr>
  <tr>
    <td>1.2.x</td><td>0.3.x</td>
  </tr>
  <tr>
    <td>1.1.x</td><td>0.2.x</td>
  </tr>
  <tr>
    <td>1.0.x</td><td>0.2.x</td>
  </tr>
</table>




## Development

```bash
npm install
bower install
grunt watch
open test/index.html
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

