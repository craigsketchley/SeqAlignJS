# SeqAlign.js

___A Sequence Alignment Tool___

[![Build Status](https://travis-ci.org/craigsketchley/SeqAlignJS.svg?branch=master)](https://travis-ci.org/craigsketchley/SeqAlignJS)

## Setup

### OSX

1. Clone [this repository](#).

2. Install Node.js by using [Homebrew](http://brew.sh/).

    ```
    $ brew install node
    ```

    Alternatively, you can get the package direct from [Node.js](http://nodejs.org).
3. Once that's installed, install the project dependencies using:

    ```
    $ node install
    ```

4. You should now have all the dependencies install and you're ready to go. From the project root directory, you can run using the following command to get more details:

    ```
    $ ./SeqAlign.js --help
    ```

### Linux

1. Clone [this repository](#).

2. Install [Node.js](http://nodejs.org).

3. Go to step 3 of the OSX setup above.

### Windows

I know you can install [Node.js](http://nodejs.org) for Windows but I've never tried. Let me know how this goes.

## Usage

### Aligning Sequencess

An example use of SeqAlign could be as follows:

```
$ ./SeqAlign.js local input/PRTN200a input/PRTN200b -m ./src/scoringMatrices/BLOSUM62 -O -5 -C -2
```

Supplied to `SeqAlign.js` is the `local` command, this tells it to complete a local sequence alignment. Next are the two FASTA format files containing the 2 sequences to be aligned, `input/PRTN200a input/PRTN200b`. The `-m /src/scoringMatrices/BLOSUM62` options indicates a scoring matrix to be used. `-O -5` specifies a gap opening cost of -5 and `-C -2` a gap continuing cost of -2 for alignment scoring.

## Testing

The tests are found in the [spec](spec) directory. They can be run using:

```
$ npm test
```