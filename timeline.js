/* Timeline bank for Throwback and Fresh Pick.
   Each answer has one year, and the game ranks the answers of a question by
   year, so equal years always score the same. The rule for which date counts
   is in each question's note. Every list is a fixed snapshot (late 2025 / 2026).
   Row format: year:Name|Alias;year:Name ... Negative years are BCE.
   Raise `version` after editing so old saved games are dropped. */
(function (root) {
  'use strict';
  const dated = (id, category, title, note, source, rows) => ({
    id, kind: 'timeline', category, title, note, source,
    answers: rows.split(';').map(s => s.trim()).filter(Boolean).map(row => {
      const separator = row.indexOf(':');
      const [name, ...aliases] = row.slice(separator + 1).split('|').map(s => s.trim()).filter(Boolean);
      return { name, aliases, year: Number(row.slice(0, separator)) };
    })
  });
  const questions = [
    dated("time-pixar", "Film", "Name a Pixar feature film.",
      "The original release year in Pixar’s feature-film catalogue. Sequels count separately; shorts do not. Collection through 2026.",
      "https://www.pixar.com/feature-films",
      `1995:Toy Story|Toy Story 1;1998:A Bug's Life;1999:Toy Story 2;2001:Monsters, Inc.|Monsters Incorporated;2003:Finding Nemo;2004:The Incredibles;
      2006:Cars|Cars 1;2007:Ratatouille;2008:WALL-E;2009:Up;2010:Toy Story 3;2011:Cars 2;2012:Brave;2013:Monsters University;2015:Inside Out|Inside Out 1;
      2015:The Good Dinosaur;2016:Finding Dory;2017:Cars 3;2017:Coco;2018:Incredibles 2;2019:Toy Story 4;2020:Onward;2020:Soul;2021:Luca;2022:Turning Red;
      2022:Lightyear;2023:Elemental;2024:Inside Out 2;2025:Elio;2026:Hoppers;2026:Toy Story 5`),
    dated("time-disney", "Film", "Name a Walt Disney Animation feature.",
      "The studio’s catalogue year, not a premiere, remake or re-release date. Pixar films are a different category. Collection through 2025.",
      "https://www.disneyanimation.com/films/",
      `1937:Snow White and the Seven Dwarfs|Snow White;1940:Pinocchio;1940:Fantasia;1941:Dumbo;1942:Bambi;1943:Saludos Amigos;1945:The Three Caballeros;
      1946:Make Mine Music;1947:Fun and Fancy Free;1948:Melody Time;1949:The Adventures of Ichabod and Mr. Toad|Ichabod and Mr Toad;1950:Cinderella;
      1951:Alice in Wonderland;1953:Peter Pan;1955:Lady and the Tramp;1959:Sleeping Beauty;1961:One Hundred and One Dalmatians|101 Dalmatians;
      1963:The Sword in the Stone;1967:The Jungle Book;1970:The Aristocats;1973:Robin Hood;1977:The Many Adventures of Winnie the Pooh;1977:The Rescuers;
      1981:The Fox and the Hound;1985:The Black Cauldron;1986:The Great Mouse Detective|Basil the Great Mouse Detective;1988:Oliver & Company;
      1989:The Little Mermaid;1990:The Rescuers Down Under;1991:Beauty and the Beast;1992:Aladdin;1994:The Lion King;1995:Pocahontas;
      1996:The Hunchback of Notre Dame;1997:Hercules;1998:Mulan;1999:Tarzan;2000:Fantasia 2000;2000:Dinosaur;2000:The Emperor's New Groove;
      2001:Atlantis: The Lost Empire|Atlantis;2002:Lilo & Stitch;2002:Treasure Planet;2003:Brother Bear;2004:Home on the Range;2005:Chicken Little;
      2007:Meet the Robinsons;2008:Bolt;2009:The Princess and the Frog;2010:Tangled;2011:Winnie the Pooh;2012:Wreck-It Ralph;2013:Frozen|Frozen 1;
      2014:Big Hero 6;2016:Zootopia|Zootropolis;2016:Moana|Vaiana;2018:Ralph Breaks the Internet|Wreck It Ralph 2;2019:Frozen 2|Frozen II;
      2021:Raya and the Last Dragon;2021:Encanto;2022:Strange World;2023:Wish;2024:Moana 2|Vaiana 2;2025:Zootopia 2|Zootropolis 2`),
    dated("time-ghibli", "Film", "Name a feature film in the Ghibli catalogue.",
      "Original Japanese release or broadcast year. Includes Nausicaä and co-productions listed by the studio; excludes shorts.",
      "https://www.ghibli.jp/works/",
      `1984:Nausicaä of the Valley of the Wind|Nausicaa;1986:Castle in the Sky|Laputa|Laputa Castle in the Sky;1988:Grave of the Fireflies;
      1988:My Neighbor Totoro|My Neighbour Totoro|Totoro;1989:Kiki's Delivery Service;1991:Only Yesterday;1992:Porco Rosso;1993:Ocean Waves;1994:Pom Poko;
      1995:Whisper of the Heart;1997:Princess Mononoke|Mononoke;1999:My Neighbors the Yamadas|My Neighbours the Yamadas;2001:Spirited Away;
      2002:The Cat Returns;2004:Howl's Moving Castle;2006:Tales from Earthsea;2008:Ponyo|Ponyo on the Cliff by the Sea;
      2010:Arrietty|The Secret World of Arrietty;2011:From Up on Poppy Hill;2013:The Wind Rises;2013:The Tale of the Princess Kaguya|Princess Kaguya;
      2014:When Marnie Was There;2016:The Red Turtle;2020:Earwig and the Witch;2023:The Boy and the Heron`),
    dated("time-nintendo", "Games", "Name a Nintendo game system.",
      "First North American release year of the named model. Home consoles and handhelds count; accessories do not. Selected models through Switch 2.",
      "https://press.nintendo.com/CompanyHistory",
      `1985:Nintendo Entertainment System|NES;1989:Game Boy|Original Game Boy;1991:Super Nintendo Entertainment System|Super Nintendo|SNES|Super NES;
      1995:Virtual Boy;1996:Game Boy Pocket;1996:Nintendo 64|N64;1998:Game Boy Color|GBC;2001:Game Boy Advance|GBA;2001:Nintendo GameCube|GameCube;
      2003:Game Boy Advance SP|GBA SP;2004:Nintendo DS|DS;2005:Game Boy Micro;2006:Nintendo DS Lite|DS Lite;2006:Wii|Nintendo Wii;2009:Nintendo DSi|DSi;
      2010:Nintendo DSi XL|DSi XL;2011:Nintendo 3DS|3DS;2012:Nintendo 3DS XL|3DS XL;2012:Wii U|Nintendo Wii U;2013:Nintendo 2DS|2DS;
      2015:New Nintendo 3DS XL|New 3DS XL;2015:New Nintendo 3DS|New 3DS;2017:New Nintendo 2DS XL|New 2DS XL;2017:Nintendo Switch|Switch;
      2019:Nintendo Switch Lite|Switch Lite;2021:Nintendo Switch OLED|Switch OLED;2025:Nintendo Switch 2|Switch 2`),
    dated("time-playstation", "Games", "Name a PlayStation console or handheld.",
      "First commercial release year anywhere in the world. Named hardware revisions count separately. Controllers, streaming accessories and VR headsets do not.",
      "https://www.playstation.com/en-us/playstation-history/",
      `1994:PlayStation|PlayStation 1|PS1|PSX;2000:PS one|PSone Slim;2000:PlayStation 2|PS2;2004:PlayStation 2 Slim|PS2 Slim|PS2 Slimline;
      2004:PlayStation Portable|PSP|PSP 1000;2006:PlayStation 3|PS3;2007:PSP 2000|PSP Slim and Lite;2008:PSP 3000;2009:PlayStation 3 Slim|PS3 Slim;
      2009:PSP Go;2011:PlayStation Vita|PS Vita|Vita;2011:PSP Street|PSP E1000;2012:PlayStation 3 Super Slim|PS3 Super Slim;2013:PlayStation 4|PS4;
      2013:PlayStation Vita Slim|PS Vita 2000|PS Vita Slim;2013:PlayStation TV|PS TV|Vita TV;2016:PlayStation 4 Slim|PS4 Slim;
      2016:PlayStation 4 Pro|PS4 Pro;2018:PlayStation Classic|PS Classic;2020:PlayStation 5|PS5;2023:PlayStation 5 Slim|PS5 Slim;
      2024:PlayStation 5 Pro|PS5 Pro`),
    dated("time-summer-hosts", "Sport", "Name a Summer Olympic host city.",
      "The first year the city hosted a modern Summer Olympic Games. Editions actually held through Paris 2024; future hosts and cancelled editions do not count.",
      "https://socialstorage.olympic.org/games_editions",
      `1896:Athens|Athina;1900:Paris;1904:St. Louis|Saint Louis;1908:London;1912:Stockholm;1920:Antwerp|Antwerpen;1928:Amsterdam;1932:Los Angeles|LA;
      1936:Berlin;1952:Helsinki;1956:Melbourne;1960:Rome|Roma;1964:Tokyo;1968:Mexico City|Ciudad de Mexico;1972:Munich|Munchen;1976:Montreal;1980:Moscow;
      1988:Seoul;1992:Barcelona;1996:Atlanta;2000:Sydney;2008:Beijing|Peking;2016:Rio de Janeiro|Rio`),
    dated("time-winter-hosts", "Sport", "Name a Winter Olympic host city.",
      "The first year the city hosted the Olympic Winter Games, up to and including Milano Cortina 2026.",
      "https://www.olympics.com/ioc/olympic-legacy/100-years-winter-legacy",
      `1924:Chamonix|Chamonix Mont Blanc;1928:St. Moritz|Saint Moritz|Sankt Moritz;1932:Lake Placid;1936:Garmisch-Partenkirchen;1952:Oslo;
      1956:Cortina d'Ampezzo|Cortina;1960:Squaw Valley|Olympic Valley;1964:Innsbruck;1968:Grenoble;1972:Sapporo;1984:Sarajevo;1988:Calgary;1992:Albertville;
      1994:Lillehammer;1998:Nagano;2002:Salt Lake City|Salt Lake;2006:Turin|Torino;2010:Vancouver;2014:Sochi;2018:Pyeongchang;2022:Beijing|Peking;
      2026:Milan|Milano`),
    dated("time-us-states", "History", "Name a U.S. state.",
      "Statehood year. For the original 13 states, this means ratifying the U.S. Constitution, not independence or colonial founding.",
      "https://www.census.gov/dataviz/visualizations/048/508.php",
      `1819:Alabama|AL;1959:Alaska|AK;1912:Arizona|AZ;1836:Arkansas|AR;1850:California|CA;1876:Colorado|CO;1788:Connecticut|CT;1787:Delaware|DE;
      1845:Florida|FL;1788:Georgia|GA;1959:Hawaii|HI;1890:Idaho|ID;1818:Illinois|IL;1816:Indiana|IN;1846:Iowa|IA;1861:Kansas|KS;1792:Kentucky|KY;
      1812:Louisiana|LA;1820:Maine|ME;1788:Maryland|MD;1788:Massachusetts|MA;1837:Michigan|MI;1858:Minnesota|MN;1817:Mississippi|MS;1821:Missouri|MO;
      1889:Montana|MT;1867:Nebraska|NE;1864:Nevada|NV;1788:New Hampshire|NH;1787:New Jersey|NJ;1912:New Mexico|NM;1788:New York|NY;1789:North Carolina|NC;
      1889:North Dakota|ND;1803:Ohio|OH;1907:Oklahoma|OK;1859:Oregon|OR;1787:Pennsylvania|PA;1790:Rhode Island|RI;1788:South Carolina|SC;
      1889:South Dakota|SD;1796:Tennessee|TN;1845:Texas|TX;1896:Utah|UT;1791:Vermont|VT;1788:Virginia|VA;1889:Washington|WA;1863:West Virginia|WV;
      1848:Wisconsin|WI;1890:Wyoming|WY`),
    dated("time-nasa-crewed", "Space", "Name a crewed Mercury, Gemini or Apollo flight.",
      "Launch year of a flown crewed mission in 1961–1972. Mission numbers or Mercury spacecraft names are accepted. Apollo 1 never launched.",
      "https://nssdc.gsfc.nasa.gov/planetary/chrono_astronaut.html",
      `1961:Mercury-Redstone 3|MR3|Freedom 7;1961:Mercury-Redstone 4|MR4|Liberty Bell 7;1962:Mercury-Atlas 6|MA6|Friendship 7;
      1962:Mercury-Atlas 7|MA7|Aurora 7;1962:Mercury-Atlas 8|MA8|Sigma 7;1963:Mercury-Atlas 9|MA9|Faith 7;1965:Gemini 3|Gemini III;1965:Gemini 4|Gemini IV;
      1965:Gemini 5|Gemini V;1965:Gemini 7|Gemini VII;1965:Gemini 6A|Gemini VI A|Gemini 6;1966:Gemini 8|Gemini VIII;1966:Gemini 9A|Gemini IX A|Gemini 9;
      1966:Gemini 10|Gemini X;1966:Gemini 11|Gemini XI;1966:Gemini 12|Gemini XII;1968:Apollo 7|Apollo VII;1968:Apollo 8|Apollo VIII;1969:Apollo 9|Apollo IX;
      1969:Apollo 10|Apollo X;1969:Apollo 11|Apollo XI;1969:Apollo 12|Apollo XII;1970:Apollo 13|Apollo XIII;1971:Apollo 14|Apollo XIV;
      1971:Apollo 15|Apollo XV;1972:Apollo 16|Apollo XVI;1972:Apollo 17|Apollo XVII`),
    dated("time-nobel-literature", "Books", "Name a Nobel Prize in Literature laureate.",
      "The year of their first Nobel Prize in Literature. Names from the 1901-2025 awards. Birth years and discoveries do not count.",
      "https://api.nobelprize.org/2.1/nobelPrizes?limit=1000&nobelPrizeYear=1901&yearTo=2025",
      `1901:Sully Prudhomme|Prudhomme;1902:Theodor Mommsen|Christian Matthias Theodor Mommsen|Mommsen;
      1903:Bjørnstjerne Bjørnson|Bjørnstjerne Martinus Bjørnson|Bjørnson;1904:Frédéric Mistral;1904:José Echegaray|José Echegaray y Eizaguirre|Echegaray;
      1905:Henryk Sienkiewicz|Sienkiewicz;1906:Giosuè Carducci|Carducci;1907:Rudyard Kipling|Kipling;1908:Rudolf Eucken|Rudolf Christoph Eucken|Eucken;
      1909:Selma Lagerlöf|Selma Ottilia Lovisa Lagerlöf|Lagerlöf;1910:Paul Heyse|Paul Johann Ludwig Heyse|Heyse;
      1911:Maurice Maeterlinck|Count Maurice (Mooris) Polidore Marie Bernhard Maeterlinck|Maeterlinck;
      1912:Gerhart Hauptmann|Gerhart Johann Robert Hauptmann|Hauptmann;1913:Rabindranath Tagore|Tagore;1915:Romain Rolland|Rolland;
      1916:Verner von Heidenstam|Carl Gustaf Verner von Heidenstam|Heidenstam;1917:Karl Gjellerup|Karl Adolph Gjellerup|Gjellerup;
      1917:Henrik Pontoppidan|Pontoppidan;1919:Carl Spitteler|Carl Friedrich Georg Spitteler|Spitteler;1920:Knut Hamsun|Knut Pedersen Hamsun|Hamsun;
      1921:Anatole France|France;1922:Jacinto Benavente|Benavente;1923:William Butler Yeats|Yeats;
      1924:Władysław Reymont|Władysław Stanisław Reymont|Reymont;1925:George Bernard Shaw|Shaw;1926:Grazia Deledda|Deledda;1927:Henri Bergson|Bergson;
      1928:Sigrid Undset|Undset;1929:Thomas Mann|Mann;1930:Sinclair Lewis|Lewis;1931:Erik Axel Karlfeldt|Karlfeldt;1932:John Galsworthy|Galsworthy;
      1933:Ivan Bunin|Ivan Alekseyevich Bunin|Bunin;1934:Luigi Pirandello|Pirandello;1936:Eugene O'Neill|Eugene Gladstone O'Neill|O'Neill;
      1937:Roger Martin du Gard|Gard;1938:Pearl Buck|Buck;1939:Frans Eemil Sillanpää|Sillanpää;1944:Johannes V. Jensen|Johannes Vilhelm Jensen|Jensen;
      1945:Gabriela Mistral;1946:Hermann Hesse|Hesse;1947:André Gide|André Paul Guillaume Gide|Gide;1948:T.S. Eliot|Thomas Stearns Eliot|Eliot;
      1949:William Faulkner|Faulkner;1950:Bertrand Russell|Earl (Bertrand Arthur William) Russell|Russell;
      1951:Pär Lagerkvist|Pär Fabian Lagerkvist|Lagerkvist;1952:François Mauriac|Mauriac;
      1953:Winston Churchill|Sir Winston Leonard Spencer Churchill|Churchill;1954:Ernest Hemingway|Ernest Miller Hemingway|Hemingway;
      1955:Halldór Laxness|Halldór Kiljan Laxness|Laxness;1956:Juan Ramón Jiménez|Jiménez;1957:Albert Camus|Camus;
      1958:Boris Pasternak|Boris Leonidovich Pasternak|Pasternak;1959:Salvatore Quasimodo|Quasimodo;1960:Saint-John Perse|Perse;1961:Ivo Andrić|Andrić;
      1962:John Steinbeck|Steinbeck;1963:Giorgos Seferis|Seferis;1964:Jean-Paul Sartre|Sartre;
      1965:Mikhail Sholokhov|Mikhail Aleksandrovich Sholokhov|Sholokhov;1966:Shmuel Agnon|Shmuel Yosef Agnon|Agnon;1966:Nelly Sachs|Sachs;
      1967:Miguel Angel Asturias|Asturias;1968:Yasunari Kawabata|Kawabata;1969:Samuel Beckett|Beckett;
      1970:Aleksandr Solzhenitsyn|Aleksandr Isayevich Solzhenitsyn|Solzhenitsyn;1971:Pablo Neruda|Neruda;1972:Heinrich Böll|Böll;1973:Patrick White|White;
      1974:Eyvind Johnson|Johnson;1974:Harry Martinson|Martinson;1975:Eugenio Montale|Montale;1976:Saul Bellow|Bellow;1977:Vicente Aleixandre|Aleixandre;
      1978:Isaac Bashevis Singer|Singer;1979:Odysseus Elytis|Elytis;1980:Czesław Miłosz|Miłosz;1981:Elias Canetti|Canetti;
      1982:Gabriel García Márquez|Márquez;1983:William Golding|Golding;1984:Jaroslav Seifert|Seifert;1985:Claude Simon|Simon;1986:Wole Soyinka|Soyinka;
      1987:Joseph Brodsky|Brodsky;1988:Naguib Mahfouz|Mahfouz;1989:Camilo José Cela|Cela;1990:Octavio Paz;1991:Nadine Gordimer|Gordimer;
      1992:Derek Walcott|Walcott;1993:Toni Morrison|Morrison;1994:Kenzaburo Oe;1995:Seamus Heaney|Heaney;1996:Wisława Szymborska|Szymborska;1997:Dario Fo;
      1998:José Saramago|Saramago;1999:Günter Grass|Grass;2000:Gao Xingjian|Xingjian;2001:V. S. Naipaul|Sir Vidiadhar Surajprasad Naipaul|Naipaul;
      2002:Imre Kertész|Kertész;2003:J. M. Coetzee|John M. Coetzee|Coetzee;2004:Elfriede Jelinek|Jelinek;2005:Harold Pinter|Pinter;2006:Orhan Pamuk|Pamuk;
      2007:Doris Lessing|Lessing;2008:Jean-Marie Gustave Le Clézio|Clézio;2009:Herta Müller|Müller;2010:Mario Vargas Llosa|Llosa;
      2011:Tomas Tranströmer|Tranströmer;2012:Mo Yan;2013:Alice Munro|Munro;2014:Patrick Modiano|Modiano;2015:Svetlana Alexievich|Alexievich;
      2016:Bob Dylan|Dylan;2017:Kazuo Ishiguro|Ishiguro;2018:Olga Tokarczuk|Tokarczuk;2019:Peter Handke|Handke;2020:Louise Glück|Glück;
      2021:Abdulrazak Gurnah|Gurnah;2022:Annie Ernaux|Ernaux;2023:Jon Fosse|Fosse;2024:Han Kang|Kang;2025:László Krasznahorkai|Krasznahorkai`),
    dated("time-nobel-physics", "Science", "Name a Nobel Prize in Physics laureate.",
      "The year of their first Nobel Prize in Physics. Names from the 1901-2025 awards. Birth years and discoveries do not count.",
      "https://api.nobelprize.org/2.1/nobelPrizes?limit=1000&nobelPrizeYear=1901&yearTo=2025",
      `1901:Wilhelm Conrad Röntgen|Röntgen;1902:Hendrik A. Lorentz|Hendrik Antoon Lorentz|Lorentz;1902:Pieter Zeeman|Zeeman;
      1903:Henri Becquerel|Antoine Henri Becquerel|Becquerel;1903:Pierre Curie;1903:Marie Curie|Marie Curie, née Skłodowska;
      1904:Lord Rayleigh|Lord Rayleigh (John William Strutt)|Rayleigh;1905:Philipp Lenard|Philipp Eduard Anton von Lenard|Lenard;
      1906:J.J. Thomson|Joseph John Thomson;1907:Albert A. Michelson|Albert Abraham Michelson|Michelson;1908:Gabriel Lippmann|Lippmann;
      1909:Guglielmo Marconi|Marconi;1909:Ferdinand Braun|Karl Ferdinand Braun|Braun;1910:Johannes Diderik van der Waals|Waals;1911:Wilhelm Wien|Wien;
      1912:Gustaf Dalén|Nils Gustaf Dalén|Dalén;1913:Heike Kamerlingh Onnes|Onnes;1914:Max von Laue|Laue;1915:William Bragg|Sir William Henry Bragg;
      1915:Lawrence Bragg|William Lawrence Bragg;1917:Charles Glover Barkla|Barkla;1918:Max Planck|Max Karl Ernst Ludwig Planck|Planck;
      1919:Johannes Stark|Stark;1920:Charles Edouard Guillaume|Guillaume;1921:Albert Einstein|Einstein;1922:Niels Bohr|Niels Henrik David Bohr;
      1923:Robert A. Millikan|Robert Andrews Millikan|Millikan;1924:Manne Siegbahn|Karl Manne Georg Siegbahn;1925:James Franck|Franck;
      1925:Gustav Hertz|Gustav Ludwig Hertz|Hertz;1926:Jean Baptiste Perrin|Perrin;1927:Arthur H. Compton|Arthur Holly Compton|Compton;
      1927:C.T.R. Wilson|Charles Thomson Rees Wilson;1928:Owen Willans Richardson;
      1929:Louis de Broglie|Prince Louis-Victor Pierre Raymond de Broglie|Broglie;1930:Sir Chandrasekhara Venkata Raman|Raman;
      1932:Werner Heisenberg|Werner Karl Heisenberg|Heisenberg;1933:Erwin Schrödinger|Schrödinger;1933:Paul A.M. Dirac|Paul Adrien Maurice Dirac|Dirac;
      1935:James Chadwick|Chadwick;1936:Victor F. Hess|Victor Franz Hess|Hess;1936:Carl D. Anderson|Carl David Anderson;
      1937:Clinton Davisson|Clinton Joseph Davisson|Davisson;1937:George Paget Thomson;1938:Enrico Fermi|Fermi;
      1939:Ernest Lawrence|Ernest Orlando Lawrence|Lawrence;1943:Otto Stern|Stern;1944:Isidor Isaac Rabi|Rabi;1945:Wolfgang Pauli|Pauli;
      1946:Percy W. Bridgman|Percy Williams Bridgman|Bridgman;1947:Edward V. Appleton|Sir Edward Victor Appleton|Appleton;
      1948:Patrick M.S. Blackett|Patrick Maynard Stuart Blackett|Blackett;1949:Hideki Yukawa|Yukawa;1950:Cecil Powell|Cecil Frank Powell|Powell;
      1951:John Cockcroft|Sir John Douglas Cockcroft|Cockcroft;1951:Ernest T.S. Walton|Ernest Thomas Sinton Walton|Walton;1952:Felix Bloch|Bloch;
      1952:E. M. Purcell|Edward Mills Purcell|Purcell;1953:Frits Zernike|Zernike;1954:Max Born|Born;1954:Walther Bothe|Bothe;
      1955:Willis E. Lamb|Willis Eugene Lamb|Lamb;1955:Polykarp Kusch|Kusch;1956:William B. Shockley|William Bradford Shockley|Shockley;
      1956:John Bardeen|Bardeen;1956:Walter H. Brattain|Walter Houser Brattain|Brattain;1957:Chen Ning Yang|Yang;1957:Tsung-Dao Lee|Tsung-Dao (T.D.) Lee;
      1958:Pavel A. Cherenkov|Pavel Alekseyevich Cherenkov|Cherenkov;1958:Il´ja M. Frank|Il´ja Mikhailovich Frank|Frank;
      1958:Igor Y. Tamm|Igor Yevgenyevich Tamm|Tamm;1959:Emilio Segrè|Emilio Gino Segrè|Segrè;1959:Owen Chamberlain|Chamberlain;
      1960:Donald A. Glaser|Donald Arthur Glaser|Glaser;1961:Robert Hofstadter|Hofstadter;1961:Rudolf Mössbauer|Rudolf Ludwig Mössbauer|Mössbauer;
      1962:Lev Landau|Lev Davidovich Landau|Landau;1963:Eugene Wigner|Eugene Paul Wigner|Wigner;1963:Maria Goeppert Mayer|Mayer;
      1963:J. Hans D. Jensen|Jensen;1964:Charles H. Townes|Charles Hard Townes|Townes;1964:Nicolay G. Basov|Nicolay Gennadiyevich Basov|Basov;
      1964:Aleksandr M. Prokhorov|Aleksandr Mikhailovich Prokhorov|Prokhorov;1965:Sin-Itiro Tomonaga|Tomonaga;1965:Julian Schwinger|Schwinger;
      1965:Richard P. Feynman|Feynman;1966:Alfred Kastler|Kastler;1967:Hans Bethe|Hans Albrecht Bethe|Bethe;1968:Luis Alvarez|Luis Walter Alvarez|Alvarez;
      1969:Murray Gell-Mann|Gell-Mann;1970:Hannes Alfvén|Hannes Olof Gösta Alfvén|Alfvén;1970:Louis Néel|Louis Eugène Félix Néel|Néel;
      1971:Dennis Gabor|Gabor;1972:Leon N. Cooper|Leon Neil Cooper|Cooper;1972:Robert Schrieffer|John Robert Schrieffer|Schrieffer;1973:Leo Esaki|Esaki;
      1973:Ivar Giaever|Giaever;1973:Brian D. Josephson|Brian David Josephson|Josephson;1974:Martin Ryle|Sir Martin Ryle|Ryle;1974:Antony Hewish|Hewish;
      1975:Aage N. Bohr|Aage Niels Bohr;1975:Ben R. Mottelson|Ben Roy Mottelson|Mottelson;1975:James Rainwater|Leo James Rainwater|Rainwater;
      1976:Burton Richter|Richter;1976:Samuel C.C. Ting|Samuel Chao Chung Ting|Ting;1977:Philip W. Anderson|Philip Warren Anderson;
      1977:Sir Nevill F. Mott|Sir Nevill Francis Mott|Mott;1977:John H. Van Vleck|John Hasbrouck Van Vleck|Vleck;
      1978:Pyotr Kapitsa|Pyotr Leonidovich Kapitsa|Kapitsa;1978:Arno Penzias|Arno Allan Penzias|Penzias;1978:Robert Woodrow Wilson;
      1979:Sheldon Glashow|Sheldon Lee Glashow|Glashow;1979:Abdus Salam|Salam;1979:Steven Weinberg|Weinberg;1980:James Cronin|James Watson Cronin|Cronin;
      1980:Val Fitch|Val Logsdon Fitch|Fitch;1981:Nicolaas Bloembergen|Bloembergen;1981:Arthur L. Schawlow|Arthur Leonard Schawlow|Schawlow;
      1981:Kai M. Siegbahn;1982:Kenneth G. Wilson;1983:Subrahmanyan Chandrasekhar|Chandrasekhar;1983:William A. Fowler|William Alfred Fowler|Fowler;
      1984:Carlo Rubbia|Rubbia;1984:Simon van der Meer|Meer;1985:Klaus von Klitzing|Klitzing;1986:Ernst Ruska|Ruska;1986:Gerd Binnig|Binnig;
      1986:Heinrich Rohrer|Rohrer;1987:J. Georg Bednorz|Bednorz;1987:K. Alex Müller|K. Alexander Müller|Müller;1988:Leon M. Lederman|Lederman;
      1988:Melvin Schwartz|Schwartz;1988:Jack Steinberger|Steinberger;1989:Norman F. Ramsey|Ramsey;1989:Hans G. Dehmelt|Dehmelt;1989:Wolfgang Paul|Paul;
      1990:Jerome I. Friedman|Friedman;1990:Henry W. Kendall|Kendall;1990:Richard E. Taylor;1991:Pierre-Gilles de Gennes|Gennes;
      1992:Georges Charpak|Charpak;1993:Russell A. Hulse|Hulse;1993:Joseph H. Taylor Jr.;1994:Bertram N. Brockhouse|Brockhouse;1994:Clifford G. Shull|Shull;
      1995:Martin L. Perl|Perl;1995:Frederick Reines|Reines;1996:David M. Lee;1996:Douglas D. Osheroff|Osheroff;1996:Robert C. Richardson;1997:Steven Chu;
      1997:Claude Cohen-Tannoudji|Cohen-Tannoudji;1997:William D. Phillips|Phillips;1998:Robert B. Laughlin|Laughlin;1998:Horst L. Störmer|Störmer;
      1998:Daniel C. Tsui|Tsui;1999:Gerardus 't Hooft|Hooft;1999:Martinus J.G. Veltman|Veltman;2000:Zhores Alferov|Zhores I. Alferov|Alferov;
      2000:Herbert Kroemer|Kroemer;2000:Jack Kilby|Jack S. Kilby|Kilby;2001:Eric Cornell|Eric A. Cornell|Cornell;2001:Wolfgang Ketterle|Ketterle;
      2001:Carl Wieman|Carl E. Wieman|Wieman;2002:Raymond Davis Jr.|Davis;2002:Masatoshi Koshiba|Koshiba;2002:Riccardo Giacconi|Giacconi;
      2003:Alexei Abrikosov|Alexei Alexeyevich Abrikosov|Abrikosov;2003:Vitaly L. Ginzburg|Vitaly Lazarevich Ginzburg|Ginzburg;
      2003:Anthony J. Leggett|Leggett;2004:David J. Gross|Gross;2004:H. David Politzer|Politzer;2004:Frank Wilczek|Wilczek;2005:Roy J. Glauber|Glauber;
      2005:John L. Hall|Hall;2005:Theodor W. Hänsch|Hänsch;2006:John C. Mather|Mather;2006:George F. Smoot|Smoot;2007:Albert Fert|Fert;
      2007:Peter Grünberg|Grünberg;2008:Yoichiro Nambu|Nambu;2008:Makoto Kobayashi|Kobayashi;2008:Toshihide Maskawa|Maskawa;
      2009:Charles K. Kao|Charles Kuen Kao;2009:Willard S. Boyle|Boyle;2009:George E. Smith|Smith;2010:Andre Geim|Geim;2010:Konstantin Novoselov|Novoselov;
      2011:Saul Perlmutter|Perlmutter;2011:Brian P. Schmidt|Schmidt;2011:Adam G. Riess|Riess;2012:Serge Haroche|Haroche;2012:David J. Wineland|Wineland;
      2013:François Englert|Englert;2013:Peter Higgs|Peter W. Higgs|Higgs;2014:Isamu Akasaki|Akasaki;2014:Hiroshi Amano|Amano;2014:Shuji Nakamura|Nakamura;
      2015:Takaaki Kajita|Kajita;2015:Arthur B. McDonald|McDonald;2016:David J. Thouless|Thouless;2016:F. Duncan M. Haldane|Haldane;
      2016:J. Michael Kosterlitz|Kosterlitz;2017:Rainer Weiss|Weiss;2017:Barry C. Barish|Barish;2017:Kip S. Thorne|Thorne;2018:Arthur Ashkin|Ashkin;
      2018:Gérard Mourou|Mourou;2018:Donna Strickland|Strickland;2019:James Peebles|Peebles;2019:Michel Mayor|Mayor;2019:Didier Queloz|Queloz;
      2020:Roger Penrose|Penrose;2020:Reinhard Genzel|Genzel;2020:Andrea Ghez|Ghez;2021:Syukuro Manabe|Manabe;2021:Klaus Hasselmann|Hasselmann;
      2021:Giorgio Parisi|Parisi;2022:Alain Aspect|Aspect;2022:John Clauser|John F. Clauser|Clauser;2022:Anton Zeilinger|Zeilinger;
      2023:Pierre Agostini|Agostini;2023:Ferenc Krausz|Krausz;2023:Anne L’Huillier|L’Huillier;2024:John J. Hopfield|Hopfield;2024:Geoffrey Hinton|Hinton;
      2025:John Clarke|Clarke;2025:Michel H. Devoret|Devoret;2025:John M. Martinis|Martinis`),
    dated("time-nobel-chemistry", "Science", "Name a Nobel Prize in Chemistry laureate.",
      "The year of their first Nobel Prize in Chemistry. Names from the 1901-2025 awards. Birth years and discoveries do not count.",
      "https://api.nobelprize.org/2.1/nobelPrizes?limit=1000&nobelPrizeYear=1901&yearTo=2025",
      `1901:Jacobus H. van 't Hoff|Jacobus Henricus van 't Hoff|Hoff;1902:Emil Fischer|Hermann Emil Fischer;
      1903:Svante Arrhenius|Svante August Arrhenius|Arrhenius;1904:Sir William Ramsay|Ramsay;
      1905:Adolf von Baeyer|Johann Friedrich Wilhelm Adolf von Baeyer|Baeyer;1906:Henri Moissan|Moissan;1907:Eduard Buchner|Buchner;
      1908:Ernest Rutherford|Rutherford;1909:Wilhelm Ostwald|Ostwald;1910:Otto Wallach|Wallach;1911:Marie Curie|Marie Curie, née Skłodowska|Curie;
      1912:Victor Grignard|Grignard;1912:Paul Sabatier|Sabatier;1913:Alfred Werner|Werner;1914:Theodore W. Richards|Theodore William Richards|Richards;
      1915:Richard Willstätter|Richard Martin Willstätter|Willstätter;1918:Fritz Haber|Haber;1920:Walther Nernst|Walther Hermann Nernst|Nernst;
      1921:Frederick Soddy|Soddy;1922:Francis W. Aston|Francis William Aston|Aston;1923:Fritz Pregl|Pregl;
      1925:Richard Zsigmondy|Richard Adolf Zsigmondy|Zsigmondy;1926:The Svedberg|The (Theodor) Svedberg;1927:Heinrich Wieland|Heinrich Otto Wieland|Wieland;
      1928:Adolf Windaus|Adolf Otto Reinhold Windaus|Windaus;1929:Arthur Harden|Harden;
      1929:Hans von Euler-Chelpin|Hans Karl August Simon von Euler-Chelpin|Euler-Chelpin;1930:Hans Fischer;1931:Carl Bosch|Bosch;
      1931:Friedrich Bergius|Bergius;1932:Irving Langmuir|Langmuir;1934:Harold C. Urey|Harold Clayton Urey|Urey;1935:Frédéric Joliot|Joliot;
      1935:Irène Joliot-Curie|Joliot-Curie;1936:Peter Debye|Petrus (Peter) Josephus Wilhelmus Debye|Debye;1937:Norman Haworth|Walter Norman Haworth|Haworth;
      1937:Paul Karrer|Karrer;1938:Richard Kuhn|Kuhn;1939:Adolf Butenandt|Adolf Friedrich Johann Butenandt|Butenandt;1939:Leopold Ruzicka|Ruzicka;
      1943:George de Hevesy|Hevesy;1944:Otto Hahn|Hahn;1945:Artturi Virtanen|Artturi Ilmari Virtanen|Virtanen;
      1946:James B. Sumner|James Batcheller Sumner|Sumner;1946:John H. Northrop|John Howard Northrop|Northrop;
      1946:Wendell M. Stanley|Wendell Meredith Stanley|Stanley;1947:Sir Robert Robinson|Robinson;1948:Arne Tiselius|Arne Wilhelm Kaurin Tiselius|Tiselius;
      1949:William F. Giauque|William Francis Giauque|Giauque;1950:Otto Diels|Otto Paul Hermann Diels|Diels;1950:Kurt Alder|Alder;
      1951:Edwin M. McMillan|Edwin Mattison McMillan|McMillan;1951:Glenn T. Seaborg|Glenn Theodore Seaborg|Seaborg;
      1952:Archer J.P. Martin|Archer John Porter Martin|Martin;1952:Richard L.M. Synge|Richard Laurence Millington Synge|Synge;
      1953:Hermann Staudinger|Staudinger;1954:Linus Pauling|Linus Carl Pauling|Pauling;1955:Vincent du Vigneaud|Vigneaud;
      1956:Sir Cyril Hinshelwood|Sir Cyril Norman Hinshelwood|Hinshelwood;1956:Nikolay Semenov|Nikolay Nikolaevich Semenov|Semenov;
      1957:Lord Todd|Lord (Alexander R.) Todd|Todd;1958:Frederick Sanger|Sanger;1959:Jaroslav Heyrovsky|Heyrovsky;
      1960:Willard F. Libby|Willard Frank Libby|Libby;1961:Melvin Calvin|Calvin;1962:Max F. Perutz|Max Ferdinand Perutz|Perutz;
      1962:John C. Kendrew|John Cowdery Kendrew|Kendrew;1963:Karl Ziegler|Ziegler;1963:Giulio Natta|Natta;1964:Dorothy Crowfoot Hodgkin|Hodgkin;
      1965:Robert B. Woodward|Robert Burns Woodward|Woodward;1966:Robert S. Mulliken|Mulliken;1967:Manfred Eigen|Eigen;
      1967:Ronald G.W. Norrish|Ronald George Wreyford Norrish|Norrish;1967:George Porter|Porter;1968:Lars Onsager|Onsager;
      1969:Derek Barton|Derek H. R. Barton|Barton;1969:Odd Hassel|Hassel;1970:Luis Leloir|Luis F. Leloir|Leloir;1971:Gerhard Herzberg|Herzberg;
      1972:Christian Anfinsen|Christian B. Anfinsen|Anfinsen;1972:Stanford Moore|Moore;1972:William H. Stein|Stein;1973:Ernst Otto Fischer;
      1973:Geoffrey Wilkinson|Wilkinson;1974:Paul J. Flory|Flory;1975:John Cornforth|John Warcup Cornforth|Cornforth;1975:Vladimir Prelog|Prelog;
      1976:William Lipscomb|William N. Lipscomb|Lipscomb;1977:Ilya Prigogine|Ilya Romanovich Prigogine|Prigogine;
      1978:Peter Mitchell|Peter D. Mitchell|Mitchell;1979:Herbert C. Brown|Brown;1979:Georg Wittig|Wittig;1980:Paul Berg|Berg;1980:Walter Gilbert|Gilbert;
      1981:Kenichi Fukui|Fukui;1981:Roald Hoffmann|Hoffmann;1982:Aaron Klug|Klug;1983:Henry Taube|Taube;
      1984:Bruce Merrifield|Robert Bruce Merrifield|Merrifield;1985:Herbert A. Hauptman|Hauptman;1985:Jerome Karle|Karle;
      1986:Dudley R. Herschbach|Herschbach;1986:Yuan T. Lee;1986:John C. Polanyi|Polanyi;1987:Donald J. Cram|Cram;1987:Jean-Marie Lehn|Lehn;
      1987:Charles J. Pedersen|Pedersen;1988:Johann Deisenhofer|Deisenhofer;1988:Robert Huber|Huber;1988:Hartmut Michel|Michel;1989:Sidney Altman|Altman;
      1989:Thomas R. Cech|Cech;1990:Elias James Corey|Corey;1991:Richard R. Ernst|Ernst;1992:Rudolph A. Marcus|Marcus;1993:Kary B. Mullis|Mullis;
      1993:Michael Smith;1994:George A. Olah|Olah;1995:Paul J. Crutzen|Crutzen;1995:Mario J. Molina|Molina;1995:F. Sherwood Rowland|Rowland;
      1996:Robert F. Curl Jr.|Curl;1996:Sir Harold Kroto|Sir Harold W. Kroto|Kroto;1996:Richard E. Smalley|Smalley;1997:Paul D. Boyer|Boyer;
      1997:John E. Walker|Walker;1997:Jens C. Skou|Skou;1998:Walter Kohn|Kohn;1998:John Pople|John A. Pople|Pople;1999:Ahmed Zewail|Ahmed H. Zewail|Zewail;
      2000:Alan Heeger|Alan J. Heeger|Heeger;2000:Alan MacDiarmid|Alan G. MacDiarmid|MacDiarmid;2000:Hideki Shirakawa|Shirakawa;
      2001:William Knowles|William S. Knowles|Knowles;2001:Ryoji Noyori|Noyori;2001:K. Barry Sharpless|Sharpless;2002:John B. Fenn|Fenn;
      2002:Koichi Tanaka|Tanaka;2002:Kurt Wüthrich|Wüthrich;2003:Peter Agre|Agre;2003:Roderick MacKinnon|MacKinnon;2004:Aaron Ciechanover|Ciechanover;
      2004:Avram Hershko|Hershko;2004:Irwin Rose|Rose;2005:Yves Chauvin|Chauvin;2005:Robert H. Grubbs|Grubbs;2005:Richard R. Schrock|Schrock;
      2006:Roger D. Kornberg|Kornberg;2007:Gerhard Ertl|Ertl;2008:Osamu Shimomura|Shimomura;2008:Martin Chalfie|Chalfie;2008:Roger Y. Tsien|Tsien;
      2009:Venkatraman Ramakrishnan|Ramakrishnan;2009:Thomas A. Steitz|Steitz;2009:Ada E. Yonath|Yonath;2010:Richard F. Heck|Heck;
      2010:Ei-ichi Negishi|Negishi;2010:Akira Suzuki|Suzuki;2011:Dan Shechtman|Shechtman;2012:Robert J. Lefkowitz|Lefkowitz;
      2012:Brian Kobilka|Brian K. Kobilka|Kobilka;2013:Martin Karplus|Karplus;2013:Michael Levitt|Levitt;2013:Arieh Warshel|Warshel;2014:Eric Betzig|Betzig;
      2014:Stefan W. Hell|Hell;2014:William E. Moerner|Moerner;2015:Tomas Lindahl|Lindahl;2015:Paul Modrich|Modrich;2015:Aziz Sancar|Sancar;
      2016:Jean-Pierre Sauvage|Sauvage;2016:Sir J. Fraser Stoddart|Stoddart;2016:Bernard L. Feringa|Feringa;2017:Jacques Dubochet|Dubochet;
      2017:Joachim Frank|Frank;2017:Richard Henderson|Henderson;2018:Frances H. Arnold|Arnold;2018:George P. Smith;2018:Sir Gregory P. Winter|Winter;
      2019:John B. Goodenough|Goodenough;2019:M. Stanley Whittingham|Whittingham;2019:Akira Yoshino|Yoshino;2020:Emmanuelle Charpentier|Charpentier;
      2020:Jennifer A. Doudna|Doudna;2021:Benjamin List|List;2021:David W.C. MacMillan|MacMillan;2022:Carolyn Bertozzi|Carolyn R. Bertozzi|Bertozzi;
      2022:Morten Meldal|Meldal;2023:Moungi Bawendi|Moungi G. Bawendi|Bawendi;2023:Louis Brus|Louis E. Brus|Brus;2023:Aleksey Yekimov;
      2024:David Baker|Baker;2024:Demis Hassabis|Hassabis;2024:John Jumper|Jumper;2025:Susumu Kitagawa|Kitagawa;2025:Richard Robson|Robson;
      2025:Omar M. Yaghi|Yaghi`),
    dated("time-bond", "Film", "Name a James Bond film.",
      "Eon Productions' official series, by UK release year. The 1967 Casino Royale spoof and Never Say Never Again do not count.",
      "https://www.007.com/the-films/",
      `1962:Dr. No|Doctor No;1963:From Russia with Love;1964:Goldfinger;1965:Thunderball;1967:You Only Live Twice;1969:On Her Majesty's Secret Service|OHMSS;
      1971:Diamonds Are Forever;1973:Live and Let Die;1974:The Man with the Golden Gun;1977:The Spy Who Loved Me;1979:Moonraker;1981:For Your Eyes Only;
      1983:Octopussy;1985:A View to a Kill;1987:The Living Daylights;1989:Licence to Kill|License to Kill;1995:GoldenEye;1997:Tomorrow Never Dies;
      1999:The World Is Not Enough;2002:Die Another Day;2006:Casino Royale;2008:Quantum of Solace;2012:Skyfall;2015:Spectre;2021:No Time to Die`),
    dated("time-star-wars", "Film", "Name a Star Wars film or series.",
      "First release year of a theatrical film or a TV or streaming series, 1977–2025. Episode numbers work too.",
      "https://www.starwars.com/films",
      `1977:Star Wars|A New Hope|Star Wars: A New Hope|Episode IV|Episode 4;1978:Star Wars Holiday Special|Holiday Special;
      1980:The Empire Strikes Back|Episode V|Episode 5;1983:Return of the Jedi|Episode VI|Episode 6;
      1984:Caravan of Courage: An Ewok Adventure|Caravan of Courage|The Ewok Adventure;1985:Ewoks: The Battle for Endor|The Battle for Endor;
      1985:Droids|Star Wars: Droids;1985:Ewoks|Star Wars: Ewoks;1999:The Phantom Menace|Episode I|Episode 1;2002:Attack of the Clones|Episode II|Episode 2;
      2005:Revenge of the Sith|Episode III|Episode 3;2008:The Clone Wars|Star Wars: The Clone Wars;2014:Rebels|Star Wars Rebels;
      2015:The Force Awakens|Episode VII|Episode 7;2016:Rogue One|Rogue One: A Star Wars Story;2017:The Last Jedi|Episode VIII|Episode 8;
      2018:Solo|Solo: A Star Wars Story;2018:Resistance|Star Wars Resistance;2019:The Rise of Skywalker|Episode IX|Episode 9;2019:The Mandalorian;
      2021:The Bad Batch;2021:Visions|Star Wars: Visions;2021:The Book of Boba Fett|Boba Fett;2022:Obi-Wan Kenobi|Kenobi;2022:Andor;2022:Tales of the Jedi;
      2023:Young Jedi Adventures;2023:Ahsoka;2024:Tales of the Empire;2024:The Acolyte;2024:Skeleton Crew;2025:Tales of the Underworld`),
    dated("time-mcu", "Film", "Name a Marvel Cinematic Universe film.",
      "US theatrical release year, 2008–2025. TV series and Sony's own Spider-Man spin-offs do not count.",
      "https://www.marvel.com/movies",
      `2008:Iron Man;2008:The Incredible Hulk;2010:Iron Man 2;2011:Thor;2011:Captain America: The First Avenger|The First Avenger|Captain America;
      2012:The Avengers|Marvel's The Avengers|Avengers Assemble;2013:Iron Man 3;2013:Thor: The Dark World|The Dark World|Thor 2;
      2014:Captain America: The Winter Soldier|The Winter Soldier|Captain America 2;2014:Guardians of the Galaxy;
      2015:Avengers: Age of Ultron|Age of Ultron|Avengers 2;2015:Ant-Man;2016:Captain America: Civil War|Civil War|Captain America 3;
      2016:Doctor Strange|Dr Strange;2017:Guardians of the Galaxy Vol. 2|Guardians of the Galaxy 2;2017:Spider-Man: Homecoming|Homecoming;
      2017:Thor: Ragnarok|Ragnarok|Thor 3;2018:Black Panther;2018:Avengers: Infinity War|Infinity War|Avengers 3;2018:Ant-Man and the Wasp;
      2019:Captain Marvel;2019:Avengers: Endgame|Endgame|Avengers 4;2019:Spider-Man: Far From Home|Far From Home;2021:Black Widow;
      2021:Shang-Chi and the Legend of the Ten Rings|Shang-Chi;2021:Eternals;2021:Spider-Man: No Way Home|No Way Home;
      2022:Doctor Strange in the Multiverse of Madness|Multiverse of Madness|Doctor Strange 2;2022:Thor: Love and Thunder|Love and Thunder|Thor 4;
      2022:Black Panther: Wakanda Forever|Wakanda Forever|Black Panther 2;2023:Ant-Man and the Wasp: Quantumania|Quantumania|Ant-Man 3;
      2023:Guardians of the Galaxy Vol. 3|Guardians of the Galaxy 3;2023:The Marvels;2024:Deadpool & Wolverine|Deadpool 3;
      2025:Captain America: Brave New World|Brave New World|Captain America 4;2025:Thunderbolts*|The New Avengers;
      2025:The Fantastic Four: First Steps|First Steps|Fantastic Four`),
    dated("time-presidents", "History", "Name a U.S. president.",
      "Year of their first inauguration. Use the full name for presidents who share a surname (Adams, Harrison, Johnson, Roosevelt, Bush).",
      "https://www.whitehouse.gov/about-the-white-house/presidents/",
      `1789:George Washington|Washington;1797:John Adams;1801:Thomas Jefferson|Jefferson;1809:James Madison|Madison;1817:James Monroe|Monroe;
      1825:John Quincy Adams|JQA;1829:Andrew Jackson|Jackson;1837:Martin Van Buren|Van Buren;1841:William Henry Harrison;1841:John Tyler|Tyler;
      1845:James K. Polk|James Polk|Polk;1849:Zachary Taylor|Taylor;1850:Millard Fillmore|Fillmore;1853:Franklin Pierce|Pierce;1857:James Buchanan|Buchanan;
      1861:Abraham Lincoln|Abe Lincoln|Lincoln;1865:Andrew Johnson;1869:Ulysses S. Grant|Ulysses Grant|Grant;
      1877:Rutherford B. Hayes|Rutherford Hayes|Hayes;1881:James A. Garfield|James Garfield|Garfield;1881:Chester A. Arthur|Chester Arthur|Arthur;
      1885:Grover Cleveland|Cleveland;1889:Benjamin Harrison;1897:William McKinley|McKinley;1901:Theodore Roosevelt|Teddy Roosevelt;
      1909:William Howard Taft|Taft;1913:Woodrow Wilson|Wilson;1921:Warren G. Harding|Warren Harding|Harding;1923:Calvin Coolidge|Coolidge;
      1929:Herbert Hoover|Hoover;1933:Franklin D. Roosevelt|Franklin Roosevelt|FDR;1945:Harry S. Truman|Harry Truman|Truman;
      1953:Dwight D. Eisenhower|Dwight Eisenhower|Eisenhower|Ike;1961:John F. Kennedy|John Kennedy|JFK|Kennedy;1963:Lyndon B. Johnson|Lyndon Johnson|LBJ;
      1969:Richard Nixon|Nixon;1974:Gerald Ford|Ford;1977:Jimmy Carter|Carter;1981:Ronald Reagan|Reagan;1989:George H. W. Bush|Bush Senior;
      1993:Bill Clinton|Clinton;2001:George W. Bush|Bush Junior;2009:Barack Obama|Obama;2017:Donald Trump|Trump;2021:Joe Biden|Biden`),
    dated("time-monarchs", "History", "Name an English or British monarch since 1066.",
      "Year they came to the throne; Charles II counts from the Restoration in 1660. Lady Jane Grey counts, Lord Protectors do not. Henry VIII and Henry 8 both work.",
      "https://en.wikipedia.org/wiki/List_of_English_monarchs",
      `1066:William I|William the Conqueror|William 1;1087:William II|William Rufus|William 2;1100:Henry I|Henry 1;1135:Stephen|King Stephen;
      1154:Henry II|Henry 2;1189:Richard I|Richard the Lionheart|Richard 1;1199:John|King John;1216:Henry III|Henry 3;1272:Edward I|Edward 1|Longshanks;
      1307:Edward II|Edward 2;1327:Edward III|Edward 3;1377:Richard II|Richard 2;1399:Henry IV|Henry 4;1413:Henry V|Henry 5;1422:Henry VI|Henry 6;
      1461:Edward IV|Edward 4;1483:Edward V|Edward 5;1483:Richard III|Richard 3;1485:Henry VII|Henry 7;1509:Henry VIII|Henry 8|Henry the Eighth;
      1547:Edward VI|Edward 6;1553:Lady Jane Grey|Jane Grey;1553:Mary I|Mary 1|Mary Tudor|Bloody Mary;1558:Elizabeth I|Elizabeth 1|Elizabeth the First;
      1603:James I|James 1|James VI and I;1625:Charles I|Charles 1;1660:Charles II|Charles 2;1685:James II|James 2;
      1689:William III|William 3|William of Orange;1689:Mary II|Mary 2;1702:Anne|Queen Anne;1714:George I|George 1;1727:George II|George 2;
      1760:George III|George 3;1820:George IV|George 4;1830:William IV|William 4;1837:Victoria|Queen Victoria;1901:Edward VII|Edward 7;
      1910:George V|George 5;1936:Edward VIII|Edward 8;1936:George VI|George 6;1952:Elizabeth II|Elizabeth 2|Queen Elizabeth II;
      2022:Charles III|Charles 3|King Charles`),
    dated("time-iphone", "Tech", "Name an iPhone model.",
      "Release year, from the original iPhone to the 2025 line-up.",
      "https://support.apple.com/en-us/108044",
      `2007:iPhone|Original iPhone|iPhone 2G|First iPhone;2008:iPhone 3G;2009:iPhone 3GS;2010:iPhone 4;2011:iPhone 4S;2012:iPhone 5;2013:iPhone 5c;
      2013:iPhone 5s;2014:iPhone 6;2014:iPhone 6 Plus;2015:iPhone 6s;2015:iPhone 6s Plus;2016:iPhone SE|iPhone SE (1st generation)|iPhone SE 1;
      2016:iPhone 7;2016:iPhone 7 Plus;2017:iPhone 8;2017:iPhone 8 Plus;2017:iPhone X|iPhone 10;2018:iPhone XR|iPhone 10R;2018:iPhone XS|iPhone 10S;
      2018:iPhone XS Max|iPhone 10S Max;2019:iPhone 11;2019:iPhone 11 Pro;2019:iPhone 11 Pro Max;2020:iPhone SE (2nd generation)|iPhone SE 2|iPhone SE 2020;
      2020:iPhone 12;2020:iPhone 12 mini;2020:iPhone 12 Pro;2020:iPhone 12 Pro Max;2021:iPhone 13;2021:iPhone 13 mini;2021:iPhone 13 Pro;
      2021:iPhone 13 Pro Max;2022:iPhone SE (3rd generation)|iPhone SE 3|iPhone SE 2022;2022:iPhone 14;2022:iPhone 14 Plus;2022:iPhone 14 Pro;
      2022:iPhone 14 Pro Max;2023:iPhone 15;2023:iPhone 15 Plus;2023:iPhone 15 Pro;2023:iPhone 15 Pro Max;2024:iPhone 16;2024:iPhone 16 Plus;
      2024:iPhone 16 Pro;2024:iPhone 16 Pro Max;2025:iPhone 16e;2025:iPhone 17;2025:iPhone Air;2025:iPhone 17 Pro;2025:iPhone 17 Pro Max`),
    dated("time-windows", "Tech", "Name a version of Microsoft Windows.",
      "Year the desktop version went on general release. Server and phone editions do not count.",
      "https://en.wikipedia.org/wiki/List_of_Microsoft_Windows_versions",
      `1985:Windows 1.0|Windows 1;1987:Windows 2.0|Windows 2;1990:Windows 3.0|Windows 3;1992:Windows 3.1;1993:Windows NT 3.1|Windows NT;
      1993:Windows for Workgroups 3.11|Windows 3.11|Windows for Workgroups;1995:Windows 95|Win95;1996:Windows NT 4.0|Windows NT 4;1998:Windows 98|Win98;
      2000:Windows 2000|Win2000|Win2k|Windows 2k;2000:Windows Me|Windows Millennium Edition|Windows Millennium;2001:Windows XP|XP;2007:Windows Vista|Vista;
      2009:Windows 7|Win7;2012:Windows 8|Win8;2013:Windows 8.1;2015:Windows 10|Win10;2021:Windows 11|Win11`),
    dated("time-languages", "Tech", "Name a programming language.",
      "Year the language first appeared publicly. A collection of well-known languages, 1957–2016.",
      "https://en.wikipedia.org/wiki/Timeline_of_programming_languages",
      `1957:Fortran;1958:Lisp;1958:ALGOL|ALGOL 58;1959:COBOL;1964:BASIC;1964:PL/I|PL/1;1967:Logo;1970:Pascal;1970:Forth;1972:C;1972:Smalltalk;1972:Prolog;
      1973:ML;1974:SQL;1975:Scheme;1977:AWK;1980:Ada;1984:MATLAB;1984:Objective-C|ObjC;1985:C++|CPP;1986:Erlang;1987:Perl;1988:Tcl;1989:Bash;1990:Haskell;
      1991:Python;1991:Visual Basic|VB;1993:Lua;1993:R;1995:Java;1995:JavaScript|JS;1995:PHP;1995:Ruby;1995:Delphi;1996:OCaml;2000:C#;2001:D;2003:Groovy;
      2004:Scala;2005:F#;2007:Clojure;2007:Scratch;2009:Go|Golang;2011:Kotlin;2011:Dart;2012:TypeScript|TS;2012:Rust;2012:Julia;2012:Elixir;2012:Elm;
      2014:Swift;2014:Solidity;2016:Zig`),
    dated("time-world-cup", "Sport", "Name a FIFA World Cup host country.",
      "First year the country hosted or co-hosted the men's World Cup, up to and including 2026.",
      "https://www.fifa.com/en/tournaments/mens/worldcup",
      `1930:Uruguay;1934:Italy;1938:France;1950:Brazil;1954:Switzerland;1958:Sweden;1962:Chile;1966:England|United Kingdom|UK;1970:Mexico;
      1974:Germany|West Germany;1978:Argentina;1982:Spain;1994:United States|USA|US|America;2002:South Korea|Korea;2002:Japan;2010:South Africa;2018:Russia;
      2022:Qatar;2026:Canada`),
    dated("time-pokemon", "Games", "Name a main-series Pokémon game.",
      "First release year anywhere, usually Japan. Paired versions count as one answer, and either name works.",
      "https://en.wikipedia.org/wiki/List_of_Pok%C3%A9mon_video_games",
      `1996:Pokémon Red and Green|Pokémon Red and Blue|Pokémon Red|Pokémon Green|Pokémon Blue|Red|Green|Blue|Red and Blue;1998:Pokémon Yellow|Yellow;
      1999:Pokémon Gold and Silver|Pokémon Gold|Pokémon Silver|Gold|Silver;2000:Pokémon Crystal|Crystal;
      2002:Pokémon Ruby and Sapphire|Pokémon Ruby|Pokémon Sapphire|Ruby|Sapphire;
      2004:Pokémon FireRed and LeafGreen|Pokémon FireRed|Pokémon LeafGreen|FireRed|LeafGreen;2004:Pokémon Emerald|Emerald;
      2006:Pokémon Diamond and Pearl|Pokémon Diamond|Pokémon Pearl|Diamond|Pearl;2008:Pokémon Platinum|Platinum;
      2009:Pokémon HeartGold and SoulSilver|Pokémon HeartGold|Pokémon SoulSilver|HeartGold|SoulSilver;
      2010:Pokémon Black and White|Pokémon Black|Pokémon White|Black|White;2012:Pokémon Black 2 and White 2|Pokémon Black 2|Pokémon White 2|Black 2|White 2;
      2013:Pokémon X and Y|Pokémon X|Pokémon Y|X|Y;2014:Pokémon Omega Ruby and Alpha Sapphire|Omega Ruby|Alpha Sapphire|ORAS;
      2016:Pokémon Sun and Moon|Pokémon Sun|Pokémon Moon|Sun|Moon;2017:Pokémon Ultra Sun and Ultra Moon|Ultra Sun|Ultra Moon;
      2018:Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!|Let's Go Pikachu|Let's Go Eevee|Let's Go;
      2019:Pokémon Sword and Shield|Pokémon Sword|Pokémon Shield|Sword|Shield;
      2021:Pokémon Brilliant Diamond and Shining Pearl|Brilliant Diamond|Shining Pearl|BDSP;2022:Pokémon Legends: Arceus|Legends Arceus|Arceus;
      2022:Pokémon Scarlet and Violet|Pokémon Scarlet|Pokémon Violet|Scarlet|Violet;2025:Pokémon Legends: Z-A|Legends Z-A|Z-A`),
    dated("time-zelda", "Games", "Name a game in The Legend of Zelda series.",
      "First release year of main-series games. Remakes, spin-offs and the CD-i games do not count.",
      "https://en.wikipedia.org/wiki/The_Legend_of_Zelda",
      `1986:The Legend of Zelda|Zelda 1;1987:Zelda II: The Adventure of Link|The Adventure of Link|Zelda II|Zelda 2;1991:A Link to the Past|ALttP;
      1993:Link's Awakening;1998:Ocarina of Time|OoT;2000:Majora's Mask;2001:Oracle of Seasons;2001:Oracle of Ages;2002:The Wind Waker;2002:Four Swords;
      2004:Four Swords Adventures;2004:The Minish Cap;2006:Twilight Princess;2007:Phantom Hourglass;2009:Spirit Tracks;2011:Skyward Sword;
      2013:A Link Between Worlds;2015:Tri Force Heroes;2017:Breath of the Wild|BotW;2023:Tears of the Kingdom|TotK;2024:Echoes of Wisdom`),
    dated("time-composers", "Music", "Name a composer of classical or film music.",
      "Year of birth. Surnames work where they are unique; use full names for shared ones such as Strauss or Schumann.",
      "https://en.wikipedia.org/wiki/List_of_classical_music_composers_by_era",
      `1098:Hildegard of Bingen|Hildegard von Bingen|Hildegard;1567:Claudio Monteverdi|Monteverdi;1653:Arcangelo Corelli|Corelli;
      1653:Johann Pachelbel|Pachelbel;1659:Henry Purcell|Purcell;1678:Antonio Vivaldi|Vivaldi;1681:Georg Philipp Telemann|Telemann;
      1683:Jean-Philippe Rameau|Rameau;1685:Johann Sebastian Bach|J. S. Bach|Bach;1685:George Frideric Handel|Georg Friedrich Händel|Handel;
      1685:Domenico Scarlatti|Scarlatti;1714:Christoph Willibald Gluck|Gluck;1732:Joseph Haydn|Franz Joseph Haydn|Haydn;1750:Antonio Salieri|Salieri;
      1756:Wolfgang Amadeus Mozart|Mozart;1770:Ludwig van Beethoven|Beethoven;1782:Niccolò Paganini|Paganini;1786:Carl Maria von Weber|Weber;
      1792:Gioachino Rossini|Rossini;1797:Franz Schubert|Schubert;1797:Gaetano Donizetti|Donizetti;1801:Vincenzo Bellini|Bellini;
      1803:Hector Berlioz|Berlioz;1804:Mikhail Glinka|Glinka;1809:Felix Mendelssohn|Mendelssohn;1810:Frédéric Chopin|Chopin;1810:Robert Schumann;
      1811:Franz Liszt|Liszt Ferenc|Liszt;1813:Richard Wagner|Wagner;1813:Giuseppe Verdi|Verdi;1819:Clara Schumann;1819:Jacques Offenbach|Offenbach;
      1822:César Franck|Franck;1824:Bedřich Smetana|Smetana;1824:Anton Bruckner|Bruckner;1825:Johann Strauss II|Johann Strauss;
      1830:Karl Goldmark|Goldmark Károly|Goldmark;1833:Johannes Brahms|Brahms;1833:Alexander Borodin|Borodin;1835:Camille Saint-Saëns|Saint-Saëns;
      1838:Georges Bizet|Bizet;1839:Modest Mussorgsky|Mussorgsky;1840:Pyotr Ilyich Tchaikovsky|Tchaikovsky;1841:Antonín Dvořák|Dvořák;
      1843:Edvard Grieg|Grieg;1844:Nikolai Rimsky-Korsakov|Rimsky-Korsakov;1845:Gabriel Fauré|Fauré;1857:Edward Elgar|Elgar;1858:Giacomo Puccini|Puccini;
      1860:Gustav Mahler|Mahler;1862:Claude Debussy|Debussy;1864:Richard Strauss;1865:Jean Sibelius|Sibelius;1866:Erik Satie|Satie;
      1873:Sergei Rachmaninoff|Rachmaninov|Rachmaninoff;1874:Arnold Schoenberg|Schoenberg|Schönberg;1874:Gustav Holst|Holst;1874:Charles Ives|Ives;
      1875:Maurice Ravel|Ravel;1877:Ernő Dohnányi|Dohnányi Ernő|Dohnányi;1881:Béla Bartók|Bartók Béla|Bartók;1882:Igor Stravinsky|Stravinsky;
      1882:Zoltán Kodály|Kodály Zoltán|Kodály;1891:Sergei Prokofiev|Prokofiev;1898:George Gershwin|Gershwin;1900:Aaron Copland|Copland;
      1906:Dmitri Shostakovich|Shostakovich;1908:Olivier Messiaen|Messiaen;1910:Samuel Barber|Barber;1913:Benjamin Britten|Britten;
      1918:Leonard Bernstein|Bernstein;1923:György Ligeti|Ligeti György|Ligeti;1926:György Kurtág|Kurtág György|Kurtág;1928:Ennio Morricone|Morricone;
      1932:John Williams;1935:Arvo Pärt|Pärt;1936:Steve Reich|Reich;1937:Philip Glass|Glass;1947:John Adams;1950:Joe Hisaishi|Hisaishi;
      1955:Ludovico Einaudi|Einaudi;1957:Hans Zimmer|Zimmer;1966:Max Richter|Richter;1971:Thomas Adès|Adès;1982:Hildur Guðnadóttir|Guðnadóttir;
      1984:Ludwig Göransson|Göransson`),
    dated("time-painters", "Art", "Name a famous painter.",
      "Year of birth. Surnames are fine where they are unique.",
      "https://en.wikipedia.org/wiki/List_of_painters_by_name",
      `1452:Leonardo da Vinci|Leonardo|Da Vinci;1471:Albrecht Dürer|Dürer;1475:Michelangelo|Michelangelo Buonarroti;1483:Raphael|Raffaello Sanzio;
      1541:El Greco;1571:Caravaggio;1577:Peter Paul Rubens|Rubens;1599:Diego Velázquez|Velázquez;1599:Anthony van Dyck|Van Dyck;
      1606:Rembrandt|Rembrandt van Rijn;1632:Johannes Vermeer|Vermeer;1697:Canaletto;1697:William Hogarth|Hogarth;1727:Thomas Gainsborough|Gainsborough;
      1746:Francisco Goya|Goya;1748:Jacques-Louis David;1757:William Blake|Blake;1760:Katsushika Hokusai|Hokusai;1774:Caspar David Friedrich;
      1775:J. M. W. Turner|William Turner|Turner;1776:John Constable|Constable;1797:Utagawa Hiroshige|Hiroshige;1798:Eugène Delacroix|Delacroix;
      1819:Gustave Courbet|Courbet;1828:Dante Gabriel Rossetti|Rossetti;1832:Édouard Manet|Manet;1834:Edgar Degas|Degas;
      1834:James McNeill Whistler|Whistler;1839:Paul Cézanne|Cézanne;1840:Claude Monet|Monet;1841:Berthe Morisot|Morisot;1841:Pierre-Auguste Renoir|Renoir;
      1844:Mary Cassatt|Cassatt;1844:Henri Rousseau|Rousseau;1844:Mihály Munkácsy|Munkácsy Mihály|Munkácsy;1848:Paul Gauguin|Gauguin;
      1853:Vincent van Gogh|Van Gogh;1853:Tivadar Csontváry Kosztka|Csontváry;1856:John Singer Sargent|Sargent;1859:Georges Seurat|Seurat;
      1862:Gustav Klimt|Klimt;1863:Edvard Munch|Munch;1864:Henri de Toulouse-Lautrec|Toulouse-Lautrec;1866:Wassily Kandinsky|Kandinsky;
      1869:Henri Matisse|Matisse;1872:Piet Mondrian|Mondrian;1879:Paul Klee|Klee;1881:Pablo Picasso|Picasso;1882:Edward Hopper|Hopper;
      1884:Amedeo Modigliani|Modigliani;1887:Marc Chagall|Chagall;1887:Georgia O'Keeffe|O'Keeffe;1890:Egon Schiele|Schiele;1893:Joan Miró|Miró;
      1898:René Magritte|Magritte;1903:Mark Rothko|Rothko;1904:Salvador Dalí|Dalí;1906:Victor Vasarely|Vasarely|Vásárhelyi Győző;
      1907:Frida Kahlo|Kahlo|Frida;1909:Francis Bacon|Bacon;1912:Jackson Pollock|Pollock;1923:Roy Lichtenstein|Lichtenstein;1928:Andy Warhol|Warhol;
      1929:Yayoi Kusama|Kusama;1932:Gerhard Richter|Richter;1937:David Hockney|Hockney;1942:Bob Ross;1958:Keith Haring|Haring;
      1960:Jean-Michel Basquiat|Basquiat`),
    dated("time-moons", "Space", "Name a moon in our Solar System.",
      "Year of discovery. Earth's Moon was never discovered, so it is not on the list.",
      "https://science.nasa.gov/solar-system/moons/",
      `1610:Io;1610:Europa;1610:Ganymede;1610:Callisto;1655:Titan;1671:Iapetus;1672:Rhea;1684:Tethys;1684:Dione;1787:Titania;1787:Oberon;1789:Enceladus;
      1789:Mimas;1846:Triton;1848:Hyperion;1851:Ariel;1851:Umbriel;1877:Phobos;1877:Deimos;1892:Amalthea;1899:Phoebe;1904:Himalia;1905:Elara;1908:Pasiphae;
      1914:Sinope;1938:Lysithea;1938:Carme;1948:Miranda;1949:Nereid;1951:Ananke;1966:Janus;1966:Epimetheus;1974:Leda;1978:Charon;1979:Metis;1979:Adrastea;
      1979:Thebe;1980:Prometheus;1980:Pandora;1980:Atlas;1980:Helene;1980:Telesto;1980:Calypso;1985:Puck;1986:Cordelia;1986:Ophelia;1986:Juliet;1986:Portia;
      1986:Belinda;1989:Proteus;1990:Pan;1997:Caliban;1997:Sycorax;2005:Nix;2005:Hydra;2005:Dysnomia;2011:Kerberos;2012:Styx`),
    dated("time-space-probes", "Space", "Name an uncrewed space probe, rover or space telescope.",
      "Launch year, from Sputnik 1 to missions launched in 2025. Crewed flights do not count.",
      "https://science.nasa.gov/solar-system/missions/",
      `1957:Sputnik 1|Sputnik;1958:Explorer 1;1959:Luna 2;1959:Luna 3;1962:Mariner 2;1964:Mariner 4;1966:Luna 9;1970:Venera 7;1970:Lunokhod 1|Lunokhod;
      1971:Mariner 9;1972:Pioneer 10;1973:Pioneer 11;1973:Mariner 10;1975:Viking 1;1975:Viking 2;1977:Voyager 1;1977:Voyager 2;1985:Giotto;1989:Magellan;
      1989:Galileo;1990:Hubble Space Telescope|Hubble|HST;1990:Ulysses;1996:Mars Pathfinder|Pathfinder;1996:Sojourner;1996:Mars Global Surveyor;
      1996:NEAR Shoemaker|NEAR;1997:Cassini|Cassini–Huygens;1997:Huygens;1999:Chandra X-ray Observatory|Chandra;1999:Stardust;2003:Mars Express;2003:Spirit;
      2003:Opportunity;2003:Hayabusa;2003:Spitzer Space Telescope|Spitzer;2004:Rosetta;2004:Philae;2004:MESSENGER;2005:Deep Impact;
      2005:Mars Reconnaissance Orbiter|MRO;2005:Venus Express;2006:New Horizons;2007:Phoenix;2007:Dawn;2009:Kepler|Kepler Space Telescope;2009:Planck;
      2009:Herschel|Herschel Space Observatory;2011:Juno;2011:Curiosity;2013:Gaia;2013:MAVEN;2013:Chang'e 3|Yutu;2014:Hayabusa2;2016:OSIRIS-REx;
      2018:InSight;2018:Parker Solar Probe;2018:TESS;2018:BepiColombo;2018:Chang'e 4|Yutu-2;2019:Chandrayaan-2;2019:Beresheet;2020:Perseverance;
      2020:Ingenuity;2020:Tianwen-1|Zhurong;2020:Hope|Emirates Mars Mission;2020:Chang'e 5;2021:James Webb Space Telescope|James Webb|JWST|Webb;2021:Lucy;
      2021:DART;2022:Artemis I|Artemis 1;2023:JUICE;2023:Euclid;2023:Chandrayaan-3|Vikram|Pragyan;2023:Psyche;2023:SLIM;2024:Europa Clipper;2024:Hera;
      2024:Chang'e 6;2025:Blue Ghost|Blue Ghost Mission 1;2025:Tianwen-2`),
    dated("time-nato", "History", "Name a NATO member country.",
      "Year the country joined NATO. Germany counts from West Germany's entry in 1955.",
      "https://www.nato.int/cps/en/natohq/topics_52044.htm",
      `1949:Belgium;1949:Canada;1949:Denmark;1949:France;1949:Iceland;1949:Italy;1949:Luxembourg;1949:Netherlands|Holland;1949:Norway;1949:Portugal;
      1949:United Kingdom|UK|Britain|Great Britain;1949:United States|USA|US|America;1952:Greece;1952:Turkey|Türkiye;1955:Germany|West Germany;1982:Spain;
      1999:Czechia|Czech Republic;1999:Hungary;1999:Poland;2004:Bulgaria;2004:Estonia;2004:Latvia;2004:Lithuania;2004:Romania;2004:Slovakia;2004:Slovenia;
      2009:Albania;2009:Croatia;2017:Montenegro;2020:North Macedonia|Macedonia;2023:Finland;2024:Sweden`),
    dated("time-eu", "History", "Name a member of the European Union.",
      "Year the country joined. The six founders count from 1958, when the European Economic Community began. Former members do not count.",
      "https://european-union.europa.eu/principles-countries-history/eu-countries_en",
      `1958:Belgium;1958:France;1958:Germany|West Germany;1958:Italy;1958:Luxembourg;1958:Netherlands|Holland;1973:Denmark;1973:Ireland;1981:Greece;
      1986:Portugal;1986:Spain;1995:Austria;1995:Finland;1995:Sweden;2004:Cyprus;2004:Czechia|Czech Republic;2004:Estonia;2004:Hungary;2004:Latvia;
      2004:Lithuania;2004:Malta;2004:Poland;2004:Slovakia;2004:Slovenia;2007:Bulgaria;2007:Romania;2013:Croatia`),
    dated("time-f1", "Sport", "Name a Formula One world champion.",
      "Year of the driver's first Drivers' Championship, 1950–2025. Use full names for shared surnames such as Hill or Rosberg.",
      "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions",
      `1950:Nino Farina|Giuseppe Farina|Farina;1951:Juan Manuel Fangio|Fangio;1952:Alberto Ascari|Ascari;1958:Mike Hawthorn|Hawthorn;
      1959:Jack Brabham|Brabham;1961:Phil Hill;1962:Graham Hill;1963:Jim Clark|Clark;1964:John Surtees|Surtees;1967:Denny Hulme|Hulme;
      1969:Jackie Stewart|Stewart;1970:Jochen Rindt|Rindt;1972:Emerson Fittipaldi|Fittipaldi;1975:Niki Lauda|Lauda;1976:James Hunt|Hunt;
      1978:Mario Andretti|Andretti;1979:Jody Scheckter|Scheckter;1980:Alan Jones|Jones;1981:Nelson Piquet|Piquet;1982:Keke Rosberg;1985:Alain Prost|Prost;
      1988:Ayrton Senna|Senna;1992:Nigel Mansell|Mansell;1994:Michael Schumacher|Schumacher;1996:Damon Hill;1997:Jacques Villeneuve|Villeneuve;
      1998:Mika Häkkinen|Häkkinen;2005:Fernando Alonso|Alonso;2007:Kimi Räikkönen|Räikkönen;2008:Lewis Hamilton|Hamilton;2009:Jenson Button|Button;
      2010:Sebastian Vettel|Vettel;2016:Nico Rosberg;2021:Max Verstappen|Verstappen;2025:Lando Norris|Norris`),
    dated("time-novels", "Books", "Name a famous novel.",
      "Year of first publication as it is usually given; serialised novels use the usual date of the finished book.",
      "",
      `1605:Don Quixote;1719:Robinson Crusoe;1726:Gulliver's Travels;1813:Pride and Prejudice;1815:Emma;1818:Frankenstein;
      1831:The Hunchback of Notre-Dame|Notre-Dame de Paris;1838:Oliver Twist;1844:The Three Musketeers;1844:The Count of Monte Cristo;1847:Jane Eyre;
      1847:Wuthering Heights;1850:David Copperfield;1851:Moby-Dick;1852:Uncle Tom's Cabin;1853:Bleak House;1859:A Tale of Two Cities;
      1861:Great Expectations;1862:Les Misérables;1865:Alice's Adventures in Wonderland|Alice in Wonderland;1866:Crime and Punishment;1868:Little Women;
      1869:War and Peace;1870:Twenty Thousand Leagues Under the Seas|Twenty Thousand Leagues Under the Sea|20,000 Leagues Under the Sea;1871:Middlemarch;
      1872:Around the World in Eighty Days|Around the World in 80 Days;1876:The Adventures of Tom Sawyer|Tom Sawyer;1878:Anna Karenina;
      1880:The Brothers Karamazov;1883:Treasure Island;1884:Adventures of Huckleberry Finn|Huckleberry Finn|Huck Finn;
      1886:Strange Case of Dr Jekyll and Mr Hyde|Dr Jekyll and Mr Hyde|Jekyll and Hyde;1890:The Picture of Dorian Gray|Dorian Gray;1895:The Time Machine;
      1897:Dracula;1898:The War of the Worlds;1900:The Wonderful Wizard of Oz|The Wizard of Oz;1902:The Hound of the Baskervilles;
      1906:The Paul Street Boys|A Pál utcai fiúk;1911:Peter and Wendy|Peter Pan;1915:The Metamorphosis;1922:Ulysses;1925:The Great Gatsby;1925:Mrs Dalloway;
      1925:The Trial;1932:Brave New World;1936:Gone with the Wind;1937:The Hobbit;1937:Of Mice and Men;1938:Rebecca;1939:The Grapes of Wrath;
      1943:The Little Prince;1945:Animal Farm;1949:Nineteen Eighty-Four|1984;1951:The Catcher in the Rye;1952:The Old Man and the Sea;1953:Fahrenheit 451;
      1954:Lord of the Flies;1954:The Lord of the Rings|The Fellowship of the Ring;1955:Lolita;1957:On the Road;1958:Things Fall Apart;
      1960:To Kill a Mockingbird;1961:Catch-22;1962:A Clockwork Orange;1965:Dune;1967:One Hundred Years of Solitude;1969:Slaughterhouse-Five;
      1979:The Hitchhiker's Guide to the Galaxy;1980:The Name of the Rose;1985:The Handmaid's Tale;1987:Beloved;1988:The Alchemist;1990:Jurassic Park;
      1997:Harry Potter and the Philosopher's Stone|Harry Potter and the Sorcerer's Stone|Harry Potter;2001:Life of Pi;2003:The Da Vinci Code;
      2003:The Kite Runner;2006:The Road;2008:The Hunger Games;2009:Wolf Hall;2018:Where the Crawdads Sing;2021:Project Hail Mary;
      2022:Tomorrow, and Tomorrow, and Tomorrow;2023:Fourth Wing`),
    dated("time-roman-emperors", "History", "Name a Roman emperor.",
      "Year their reign began, from Augustus to Justinian. Co-emperors count from the year they were proclaimed.",
      "https://en.wikipedia.org/wiki/List_of_Roman_emperors",
      `-27:Augustus|Octavian|Caesar Augustus;14:Tiberius;37:Caligula;41:Claudius;54:Nero;68:Galba;69:Otho;69:Vitellius;69:Vespasian;79:Titus;81:Domitian;
      96:Nerva;98:Trajan;117:Hadrian;138:Antoninus Pius;161:Marcus Aurelius;161:Lucius Verus;177:Commodus;193:Pertinax;193:Didius Julianus;
      193:Septimius Severus;198:Caracalla;209:Geta;217:Macrinus;218:Elagabalus|Heliogabalus;222:Severus Alexander|Alexander Severus;
      235:Maximinus Thrax|Maximinus I;238:Gordian I;238:Gordian II;238:Pupienus;238:Balbinus;238:Gordian III;244:Philip the Arab|Philip I;
      249:Decius|Trajan Decius;253:Valerian;253:Gallienus;268:Claudius Gothicus|Claudius II;270:Aurelian;276:Probus;284:Diocletian;286:Maximian;
      305:Constantius I|Constantius Chlorus;305:Galerius;306:Constantine the Great|Constantine I|Constantine;308:Licinius;337:Constantius II;337:Constans;
      337:Constantine II;361:Julian|Julian the Apostate;363:Jovian;364:Valentinian I|Valentinian;364:Valens;367:Gratian;
      379:Theodosius I|Theodosius the Great|Theodosius;383:Arcadius;393:Honorius;475:Romulus Augustulus;527:Justinian I|Justinian the Great|Justinian`)
  ];
  root.GuessTimeline = { version: 2, questions };
  if (typeof module !== 'undefined') module.exports = root.GuessTimeline;
})(typeof window !== 'undefined' ? window : globalThis);
