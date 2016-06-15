'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt;
  var deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt;
  var _ref$_isDeleted = _ref._isDeleted;

  var _isDeleted = _ref$_isDeleted === undefined ? '_isDeleted' : _ref$_isDeleted;

  var _ref$scrub = _ref.scrub;
  var scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, _isDeleted: _isDeleted, scrub: scrub });

  var properties = Model.definition.properties;

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop].id && prop !== _isDeleted;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false });
  Model.defineProperty(_isDeleted, { required: false, default: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    var _extends3;

    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (_extends3 = {}, (0, _defineProperty3.default)(_extends3, deletedAt, new Date()), (0, _defineProperty3.default)(_extends3, _isDeleted, true), _extends3))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    var _extends4;

    return Model.updateAll({ id: id }, (0, _extends7.default)({}, scrubbed, (_extends4 = {}, (0, _defineProperty3.default)(_extends4, deletedAt, new Date()), (0, _defineProperty3.default)(_extends4, _isDeleted, true), _extends4))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var _extends5;

    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (_extends5 = {}, (0, _defineProperty3.default)(_extends5, deletedAt, new Date()), (0, _defineProperty3.default)(_extends5, _isDeleted, true), _extends5))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = {
    or: [(0, _defineProperty3.default)({}, _isDeleted, { exists: false }), (0, _defineProperty3.default)({}, _isDeleted, false)]
  };

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.where) query.where = {};

    if (!query.deleted) {
      query.where = { and: [query.where, queryNonDeleted] };
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.where) query.where = {};

    if (!query.deleted) {
      query.where = { and: [query.where, queryNonDeleted] };
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QU8sS0FBSyxDQUFDLElBQUksTUFBQSxDQUFWLEtBQUssR0FBTSxLQUFLLEVBQUUsS0FBSyxTQUFLLElBQUksRUFBQyxDQUFDO0dBQzFDLENBQUM7O0FBRUYsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUMzQixPQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsWUFBWSxHQUFzQjtRQUFyQixLQUFLLHlEQUFHLEVBQUU7OztBQUU1QyxRQUFNLGVBQWUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFFLEtBQUssRUFBRSxlQUFlLENBQUUsRUFBRSxDQUFDOzt1Q0FGWCxJQUFJO0FBQUosVUFBSTs7O0FBR3JELFdBQU8sTUFBTSxDQUFDLElBQUksTUFBQSxDQUFYLE1BQU0sR0FBTSxLQUFLLEVBQUUsZUFBZSxTQUFLLElBQUksRUFBQyxDQUFDO0dBQ3JELENBQUM7O0FBRUYsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUM3QixPQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxhQUFhLEdBQXNCO1FBQXJCLEtBQUsseURBQUcsRUFBRTs7O0FBRWhFLFFBQU0sZUFBZSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBRSxFQUFFLENBQUM7O3VDQUZTLElBQUk7QUFBSixVQUFJOzs7QUFHekUsV0FBTyxPQUFPLENBQUMsSUFBSSxNQUFBLENBQVosT0FBTyxHQUFNLEtBQUssRUFBRSxlQUFlLFNBQUssSUFBSSxFQUFDLENBQUM7R0FDdEQsQ0FBQztDQUNIIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0JywgX2lzRGVsZXRlZCA9ICdfaXNEZWxldGVkJywgc2NydWIgPSBmYWxzZSB9KSA9PiB7XG4gIGRlYnVnKCdTb2Z0RGVsZXRlIG1peGluIGZvciBNb2RlbCAlcycsIE1vZGVsLm1vZGVsTmFtZSk7XG5cbiAgZGVidWcoJ29wdGlvbnMnLCB7IGRlbGV0ZWRBdCwgX2lzRGVsZXRlZCwgc2NydWIgfSk7XG5cbiAgY29uc3QgcHJvcGVydGllcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wZXJ0aWVzVG9TY3J1YiA9IHNjcnViO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVG9TY3J1YikpIHtcbiAgICAgIHByb3BlcnRpZXNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihwcm9wID0+ICFwcm9wZXJ0aWVzW3Byb3BdLmlkICYmIHByb3AgIT09IF9pc0RlbGV0ZWQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7dHlwZTogRGF0ZSwgcmVxdWlyZWQ6IGZhbHNlfSk7XG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KF9pc0RlbGV0ZWQsIHtyZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdDogZmFsc2V9KTtcblxuICBNb2RlbC5kZXN0cm95QWxsID0gZnVuY3Rpb24gc29mdERlc3Ryb3lBbGwod2hlcmUsIGNiKSB7XG4gICAgcmV0dXJuIE1vZGVsLnVwZGF0ZUFsbCh3aGVyZSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCksIFtfaXNEZWxldGVkXTogdHJ1ZSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlID0gTW9kZWwuZGVzdHJveUFsbDtcbiAgTW9kZWwuZGVsZXRlQWxsID0gTW9kZWwuZGVzdHJveUFsbDtcblxuICBNb2RlbC5kZXN0cm95QnlJZCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QnlJZChpZCwgY2IpIHtcbiAgICByZXR1cm4gTW9kZWwudXBkYXRlQWxsKHsgaWQ6IGlkIH0sIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpLCBbX2lzRGVsZXRlZF06IHRydWUgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnJlbW92ZUJ5SWQgPSBNb2RlbC5kZXN0cm95QnlJZDtcbiAgTW9kZWwuZGVsZXRlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuXG4gIE1vZGVsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gc29mdERlc3Ryb3kob3B0aW9ucywgY2IpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IChjYiA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSA/IG9wdGlvbnMgOiBjYjtcblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCksIFtfaXNEZWxldGVkXTogdHJ1ZSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtcbiAgICBvcjogW1xuICAgICAgeyBbX2lzRGVsZXRlZF06IHsgZXhpc3RzOiBmYWxzZSB9IH0sXG4gICAgICB7IFtfaXNEZWxldGVkXTogZmFsc2UgfSxcbiAgICBdLFxuICB9O1xuXG4gIGNvbnN0IF9maW5kT3JDcmVhdGUgPSBNb2RlbC5maW5kT3JDcmVhdGU7XG4gIE1vZGVsLmZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uIGZpbmRPckNyZWF0ZURlbGV0ZWQocXVlcnkgPSB7fSwgLi4ucmVzdCkge1xuICAgIGlmICghcXVlcnkud2hlcmUpIHF1ZXJ5LndoZXJlID0ge307XG5cbiAgICBpZiAoIXF1ZXJ5LmRlbGV0ZWQpIHtcbiAgICAgIHF1ZXJ5LndoZXJlID0geyBhbmQ6IFsgcXVlcnkud2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9maW5kT3JDcmVhdGUuY2FsbChNb2RlbCwgcXVlcnksIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF9maW5kID0gTW9kZWwuZmluZDtcbiAgTW9kZWwuZmluZCA9IGZ1bmN0aW9uIGZpbmREZWxldGVkKHF1ZXJ5ID0ge30sIC4uLnJlc3QpIHtcbiAgICBpZiAoIXF1ZXJ5LndoZXJlKSBxdWVyeS53aGVyZSA9IHt9O1xuXG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBjb25zdCB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICByZXR1cm4gX2NvdW50LmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX3VwZGF0ZSA9IE1vZGVsLnVwZGF0ZTtcbiAgTW9kZWwudXBkYXRlID0gTW9kZWwudXBkYXRlQWxsID0gZnVuY3Rpb24gdXBkYXRlRGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSB1cGRhdGUvdXBkYXRlQWxsIG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBjb25zdCB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICByZXR1cm4gX3VwZGF0ZS5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
