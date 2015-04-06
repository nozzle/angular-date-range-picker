(function() {


    var module = angular.module("nzDatepicker", []);

    module.directive("nzDatepicker", ["$compile", "$timeout", function($compile, $timeout) {
        var CUSTOM = "CUSTOM";

        return {
            restrict: "AE",
            replace: false,
            template: [
                '<span tabindex="0" ng-keydown="hide()" class="nz-datepicker-input">',
                '     <span ng-if="showRanged">',
                '          <span ng-show="!!model">{{model.start.format("ll")}}-{{model.end.format("ll")}}</span>',
                '          <span ng-hide="!!model">Select date range</span>',
                '     </span>',
                '     <span ng-if="!showRanged">',
                '          <span ng-show="!!model">{{model.format("ll")}}</span>',
                '          <span ng-hide="!!model">Select date</span>',
                '     </span>',
                '</span>',
                '<div ng-show="visible" class="nz-datepicker-picker" ng-click="handlePickerClick($event)" ng-class="{\'nz-datepicker-ranged\': showRanged }">',
                '    <div class="nz-datepicker-timesheet">',
                '        <a ng-click="move(-1, $event)" class="nz-datepicker-prev-month">&#9664;</a>',
                '        <div ng-repeat="month in months" class="nz-datepicker-month">',
                '            <div class="nz-datepicker-month-name">{{month.name}}</div>',
                '            <table class="nz-datepicker-calendar">',
                '                <tr>',
                '                    <th ng-repeat="day in month.weeks[1]" class="nz-datepicker-calendar-weekday">{{day.date.format(\'dd\')}}</th>',
                '                </tr>',
                '                <tr ng-repeat="week in month.weeks">',
                '                    <td ng-class="{\'nz-datepicker-calendar-day\': day,\'nz-datepicker-calendar-day-selected\': day.selected,\'nz-datepicker-calendar-day-disabled\': day.disabled,\'nz-datepicker-calendar-day-start\': day.start}" ng-repeat="day in week track by $index" ng-click="select(day, $event)">',
                '                        <div class="nz-datepicker-calendar-day-wrapper">{{day.date.date()}}</div>',
                '                    </td>',
                '                </tr>',
                '            </table>',
                '        </div>',
                '        <a ng-click="move(+1, $event)" class="nz-datepicker-next-month">&#9654;</a>',
                '    </div>',
                '    <div class="nz-datepicker-panel">',
                '       <span ng-show="showRanged">',
                '           <select ng-click="prevent_select($event)" ng-model="quick" ng-options="e.range as e.label for e in quickList">',
                '           </select>',
                '       </span>',
                '        <span class="nz-datepicker-buttons"><a ng-click="ok($event)" class="nz-datepicker-apply">Apply</a><a ng-click="hide($event)" class="nz-datepicker-cancel">cancel</a></span>',
                '    </div>',
                '</div>',
            ].join(''),
            scope: {
                model: "=ngModel",
                options: "=?",
                ranged: "=",
                pastDates: "@",
                callback: "&"
            },
            link: function($scope, element, attrs) {

                $scope.quick = null;
                $scope.range = null;
                $scope.selecting = false;
                $scope.visible = false;
                $scope.start = null;
                $scope.showRanged = $scope.ranged === void 0 ? true : $scope.ranged;

                if (!$scope.options || !$scope.options.length) {
                    $scope.options = defaultOptions();
                }

                // Methods

                $scope.show = show;
                $scope.hide = hide;
                $scope.prevent_select = prevent_select;
                $scope.ok = ok;
                $scope.select = select;
                $scope.move = move;
                $scope.handlePickerClick = handlePickerClick;

                // Events
                angular.element(document).bind("click", documentClickFn);
                element.bind("click", function(e) {
                    if (e != null) {
                        if (typeof e.stopPropagation === "function") {
                            e.stopPropagation();
                        }
                    }
                    return $scope.$apply(function() {
                        if ($scope.visible) {
                            return $scope.hide();
                        } else {
                            return $scope.show();
                        }
                    });
                });

                $scope.$watch("quick", function(q, o) {
                    if (!q || q === CUSTOM) {
                        return;
                    }
                    $scope.selection = $scope.quick;
                    $scope.selecting = false;
                    $scope.start = null;
                    calculateRange();
                    return prepare();
                });
                $scope.$watch("options", function(value) {
                    if (typeof options === "undefined" || options === null) {
                        return;
                    }
                    return $scope.options = value;
                });

                // Cleanup
                $scope.$on('$destroy', function() {
                    return angular.element(document).unbind('click', documentClickFn);
                });


                // Init
                makeOptions();
                calculateRange();


                return prepare();









                function defaultOptions() {
                    return [{
                        label: "This week",
                        range: moment().range(moment().startOf("week").startOf("day"), moment().endOf("week").startOf("day"))
                    }, {
                        label: "Next week",
                        range: moment().range(moment().startOf("week").add(1, "week").startOf("day"), moment().add(1, "week").endOf("week").startOf("day"))
                    }, {
                        label: "This fortnight",
                        range: moment().range(moment().startOf("week").startOf("day"), moment().add(1, "week").endOf("week").startOf("day"))
                    }, {
                        label: "This month",
                        range: moment().range(moment().startOf("month").startOf("day"), moment().endOf("month").startOf("day"))
                    }, {
                        label: "Next month",
                        range: moment().range(moment().startOf("month").add(1, "month").startOf("day"), moment().add(1, "month").endOf("month").startOf("day"))
                    }];
                }

                function show() {
                    $scope.selection = $scope.model;
                    calculateRange();
                    prepare();
                    return $scope.visible = true;
                }

                function hide($event) {
                    if ($event != null) {
                        if (typeof $event.stopPropagation === "function") {
                            $event.stopPropagation();
                        }
                    }
                    $scope.visible = false;
                    return $scope.start = null;
                }

                function prevent_select($event) {
                    return $event != null ? typeof $event.stopPropagation === "function" ? $event.stopPropagation() : void 0 : void 0;
                }

                function ok($event) {
                    if ($event != null) {
                        if (typeof $event.stopPropagation === "function") {
                            $event.stopPropagation();
                        }
                    }
                    $scope.model = $scope.selection;
                    $timeout(function() {
                        if ($scope.callback) {
                            return $scope.callback();
                        }
                    });
                    return $scope.hide();
                }

                function select(day, $event) {
                    if ($event != null) {
                        if (typeof $event.stopPropagation === "function") {
                            $event.stopPropagation();
                        }
                    }
                    if (day.disabled) {
                        return;
                    }
                    if ($scope.showRanged) {
                        $scope.selecting = !$scope.selecting;
                        if ($scope.selecting) {
                            $scope.start = day.date;
                        } else {
                            if ($scope.start.diff(day.date, 'days') > 0) {
                                $scope.selection = moment().range(day.date, $scope.start);
                            } else {
                                $scope.selection = moment().range($scope.start, day.date);
                            }
                            $scope.start = null;
                        }
                    } else {
                        $scope.selection = moment(day.date);
                    }
                    return prepare();
                }

                function move(n, $event) {
                    if ($event != null) {
                        if (typeof $event.stopPropagation === "function") {
                            $event.stopPropagation();
                        }
                    }
                    if ($scope.showRanged) {
                        $scope.range = moment().range($scope.range.start.add(n, 'months').startOf("month").startOf("day"), $scope.range.start.clone().add(2, "months").endOf("month").startOf("day"));
                    } else {
                        $scope.date.add(n, 'months');
                        $scope.range = moment().range(moment($scope.date).startOf("month"), moment($scope.date).endOf("month"));
                    }
                    return prepare();
                }

                function handlePickerClick($event) {
                    return $event != null ? typeof $event.stopPropagation === "function" ? $event.stopPropagation() : void 0 : void 0;
                }

                function documentClickFn(e) {
                    $scope.$apply(function() {
                        return $scope.hide();
                    });
                    return true;
                }

                function makeOptions(custom) {
                    var e, i, len, ref, results;
                    if (custom == null) {
                        custom = false;
                    }
                    if (!$scope.showRanged) {
                        return;
                    }
                    $scope.quickList = [];
                    if (custom) {
                        $scope.quickList.push({
                            label: "Custom",
                            range: CUSTOM
                        });
                    }
                    ref = $scope.options;
                    results = [];
                    for (i = 0, len = ref.length; i < len; i++) {
                        e = ref[i];
                        results.push($scope.quickList.push(e));
                    }
                    return results;
                }

                function calculateRange() {
                    var end, start;
                    if ($scope.showRanged) {
                        return $scope.range = $scope.selection ? (start = $scope.selection.start.clone().startOf("month").startOf("day"), end = start.clone().add(2, "months").endOf("month").startOf("day"), moment().range(start, end)) : moment().range(moment().startOf("month").subtract(1, "month").startOf("day"), moment().endOf("month").add(1, "month").startOf("day"));
                    } else {
                        $scope.selection = false;
                        $scope.selection = $scope.model || false;
                        $scope.date = moment($scope.model) || moment();
                        return $scope.range = moment().range(moment($scope.date).startOf("month"), moment($scope.date).endOf("month"));
                    }
                }

                function checkQuickList() {
                    var e, i, len, ref;
                    if (!$scope.showRanged) {
                        return;
                    }
                    if (!$scope.selection) {
                        return;
                    }
                    ref = $scope.quickList;
                    for (i = 0, len = ref.length; i < len; i++) {
                        e = ref[i];
                        if (e.range !== CUSTOM && $scope.selection.start.startOf("day").unix() === e.range.start.startOf("day").unix() && $scope.selection.end.startOf("day").unix() === e.range.end.startOf("day").unix()) {
                            $scope.quick = e.range;
                            makeOptions();
                            return;
                        }
                    }
                    $scope.quick = CUSTOM;
                    return makeOptions(true);
                }

                function prepare() {
                    var i, len, m, ref, startDay, startIndex;
                    $scope.months = [];
                    startIndex = $scope.range.start.year() * 12 + $scope.range.start.month();
                    startDay = moment().startOf("week").day();
                    $scope.range.by("days", function(date) {
                        var base, base1, d, dis, m, sel, w;
                        d = date.day() - startDay;
                        if (d < 0) {
                            d = 7 + d;
                        }
                        m = date.year() * 12 + date.month() - startIndex;
                        w = parseInt((7 + date.date() - d) / 7);
                        sel = false;
                        dis = false;
                        if ($scope.showRanged) {
                            if ($scope.start) {
                                sel = date === $scope.start;
                                dis = date < $scope.start;
                            } else {
                                sel = $scope.selection && $scope.selection.contains(date);
                            }
                        } else {
                            sel = date.isSame($scope.selection);
                            if ($scope.pastDates) {
                                dis = moment().diff(date, 'days') > 0;
                            }
                        }
                        (base = $scope.months)[m] || (base[m] = {
                            name: date.format("MMMM YYYY"),
                            weeks: []
                        });
                        (base1 = $scope.months[m].weeks)[w] || (base1[w] = []);
                        return $scope.months[m].weeks[w][d] = {
                            date: date,
                            selected: sel,
                            disabled: false,
                            start: $scope.start && $scope.start.unix() === date.unix()
                        };
                    });
                    ref = $scope.months;
                    for (i = 0, len = ref.length; i < len; i++) {
                        m = ref[i];
                        if (!m.weeks[0]) {
                            m.weeks.splice(0, 1);
                        }
                    }
                    return checkQuickList();
                }
            }
        };
    }]);
})();
