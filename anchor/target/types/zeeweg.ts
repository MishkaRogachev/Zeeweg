/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zeeweg.json`.
 */
export type Zeeweg = {
  "address": "HGY1cAiRYbgAcCFpSU9cYw21wpj9gVgWERpo8RRTeZdu",
  "metadata": {
    "name": "zeeweg",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addMarker",
      "discriminator": [
        55,
        90,
        160,
        157,
        0,
        80,
        79,
        241
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "markerEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "position.lat"
              },
              {
                "kind": "arg",
                "path": "position.lon"
              }
            ]
          }
        },
        {
          "name": "markerTile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  116,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "position.tile(TILE_RESOLUTION).x"
              },
              {
                "kind": "arg",
                "path": "position.tile(TILE_RESOLUTION).y"
              }
            ]
          }
        },
        {
          "name": "markerAuthor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "author"
              }
            ]
          }
        },
        {
          "name": "markerVotes",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "markerEntry"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": {
            "defined": {
              "name": "markerDescription"
            }
          }
        },
        {
          "name": "position",
          "type": {
            "defined": {
              "name": "position"
            }
          }
        }
      ]
    },
    {
      "name": "deleteMarker",
      "discriminator": [
        123,
        169,
        147,
        213,
        252,
        203,
        3,
        129
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "signer": true,
          "relations": [
            "markerEntry"
          ]
        },
        {
          "name": "markerEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "position.lat"
              },
              {
                "kind": "arg",
                "path": "position.lon"
              }
            ]
          }
        },
        {
          "name": "markerTile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  116,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "position.tile(TILE_RESOLUTION).x"
              },
              {
                "kind": "arg",
                "path": "position.tile(TILE_RESOLUTION).y"
              }
            ]
          }
        },
        {
          "name": "markerAuthor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "author"
              }
            ]
          }
        },
        {
          "name": "markerVotes",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "markerEntry"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "position",
          "type": {
            "defined": {
              "name": "position"
            }
          }
        }
      ]
    },
    {
      "name": "unvoteMarker",
      "discriminator": [
        192,
        247,
        238,
        129,
        37,
        23,
        207,
        175
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "markerEntry"
        },
        {
          "name": "markerVotes",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "markerEntry"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateMarker",
      "discriminator": [
        166,
        160,
        13,
        210,
        202,
        44,
        188,
        90
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "signer": true,
          "relations": [
            "markerEntry"
          ]
        },
        {
          "name": "markerEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "position.lat"
              },
              {
                "kind": "arg",
                "path": "position.lon"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": {
            "defined": {
              "name": "markerDescription"
            }
          }
        },
        {
          "name": "position",
          "type": {
            "defined": {
              "name": "position"
            }
          }
        }
      ]
    },
    {
      "name": "voteMarker",
      "discriminator": [
        147,
        153,
        217,
        142,
        206,
        27,
        105,
        39
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "markerEntry"
        },
        {
          "name": "markerVotes",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "markerEntry"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": {
            "defined": {
              "name": "voteValue"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "markerAuthor",
      "discriminator": [
        208,
        93,
        205,
        129,
        122,
        162,
        49,
        134
      ]
    },
    {
      "name": "markerEntry",
      "discriminator": [
        155,
        135,
        137,
        236,
        114,
        198,
        64,
        152
      ]
    },
    {
      "name": "markerTile",
      "discriminator": [
        21,
        246,
        172,
        206,
        96,
        252,
        156,
        193
      ]
    },
    {
      "name": "markerVotes",
      "discriminator": [
        138,
        32,
        123,
        101,
        200,
        120,
        235,
        180
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6001,
      "name": "noExistingVote",
      "msg": "No existing vote"
    }
  ],
  "types": [
    {
      "name": "markerAuthor",
      "docs": [
        "MarkerAuthor is a PDA that stores mapping author -> markers.",
        "PDA: [b\"marker_author\", author_pubkey]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "markers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "markerDescription",
      "docs": [
        "MarkerDescription holds metadata about a marker, including its name, details, and type."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "details",
            "type": "string"
          },
          {
            "name": "markerType",
            "type": {
              "defined": {
                "name": "markerType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "markerEntry",
      "docs": [
        "MarkerEntry is a PDA that stores the marker's author, metadata, position on the map and timestamps."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "description",
            "type": {
              "defined": {
                "name": "markerDescription"
              }
            }
          },
          {
            "name": "position",
            "type": {
              "defined": {
                "name": "position"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "markerTile",
      "docs": [
        "MarkerTile is a PDA that stores mapping tile -> markers.",
        "PDA: [b\"marker_tile\", tile.x.to_le_bytes(), tile.y.to_le_bytes()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tile",
            "type": {
              "defined": {
                "name": "tile"
              }
            }
          },
          {
            "name": "markers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "markerType",
      "docs": [
        "MarkerType enum representing different types of markers."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "basic"
          },
          {
            "name": "park"
          },
          {
            "name": "beach"
          },
          {
            "name": "mountainPeak"
          },
          {
            "name": "historical"
          },
          {
            "name": "restaurant"
          },
          {
            "name": "hazard"
          }
        ]
      }
    },
    {
      "name": "markerVote",
      "docs": [
        "MarkerVote struct represents a vote cast by a user on a marker."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "value",
            "type": {
              "defined": {
                "name": "voteValue"
              }
            }
          }
        ]
      }
    },
    {
      "name": "markerVotes",
      "docs": [
        "MarkerVotes is a PDA that stores votes for markers",
        "PDA: [b\"marker_vote\", marker_pubkey]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "votes",
            "type": {
              "vec": {
                "defined": {
                  "name": "markerVote"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "position",
      "docs": [
        "Position represents a geographical point in WGS84 coordinate system",
        "on the map using latitude and longitude in microdegrees ( degrees * 1e6)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lat",
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "tile",
      "docs": [
        "Tile represents a fixed-size square region on the map,",
        "defined by a resolution in microdegrees (e.g. 100_000 = 0.1°).",
        "",
        "For example, given:",
        "lat = 43160889 (43.160889°)",
        "",
        "lon = -2934364 (-2.934364°)",
        "and resolution = 100_000,",
        "the resulting tile will be:",
        "x = 43160889 / 100_000 = 431",
        "y = -2934364 / 100_000 = -29",
        "",
        "This allows grouping markers spatially for fast region queries."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": "i32"
          },
          {
            "name": "y",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "voteValue",
      "docs": [
        "VoteValue is the type of vote: upvote or downvote."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "upvote"
          },
          {
            "name": "downvote"
          }
        ]
      }
    }
  ]
};
