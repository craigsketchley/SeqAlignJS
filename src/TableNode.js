/**
 * TableNode for the dynamic programming grid.
 * 
 * @param {int} i x position of node in table
 * @param {int} j y position of node in table
 */
var TableNode = function(i, j, initVal) {
	this.val = initVal;
	this.i = i;
	this.j = j;
	this.tracebackI;
	this.tracebackJ;
};

/**
 * Returns the current state of the TableNode as a string.
 * 
 * @return {String} The string representation of this TableNode.
 */
TableNode.prototype.toString = function() {
	var traceback = "$";
	if (this.tracebackI === this.i - 1 && this.tracebackJ === this.j - 1) {
		traceback = "\\";
	} else if (this.tracebackI === this.i - 1) {
		traceback = "-";
	} else if (this.tracebackJ === this.j - 1) {
		traceback = "|";
	} else if (this.tracebackI === 0 && this.tracebackJ === 0) {
		traceback = "f";
	}
	var outputVal = (this.val === -Infinity) ? '#' : this.val;
	return "(" + outputVal + ", " + traceback + ")";
};

module.exports = TableNode;