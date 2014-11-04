# TODO List:

- [ ] Parse the scoring matrix from a file?
- [ ] Global alignment
- [ ] Local alignment
- [ ] Affine gap penalties
- [ ] Overlap alignment
- [ ] Query alignment
- [ ] Semi-global alignment
- [ ] Spanning alignment
- [ ] Longest Common Subsequence
- [ ] Protein alignment? - w/BOSUM & PAM
- [ ] Codon alignment?
- [ ] TESTING.

## Alignments

### Global alignment
Find an alignment of s and t whose score is maximal among all possible alignments of s and t.

### Local alignment
Find a maximum scoring alignment of any substring of s to any substring in t.

### Overlap alignment
Find a maximum scoring alignment of s and t that allows no indels and only permits a suffix of s to be matched with a prefix of t.

### Query alignment
Find a maximum alignment of all of s to any substring of t.

### Semi-global alignment
A variation on the global alignment problem, but where the gaps at the ends of either sequence are not counted; this corresponds to a situation where we don't know we have the complete sequences, for, say, two genes.

### Spanning alignment
A variation on global alignment, where the sequences s and t must begin and end together; that is, there are no gaps at either end.

### Longest Common Subsequence
Find a maximum scoring global alignment where only perfect matches are scored 1, and everything else (indels and mismatches) get 0.