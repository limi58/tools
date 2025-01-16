package ssq

import (
	"fmt"
	"math/rand/v2"
	"sort"
	"strconv"
	"strings"
)

const redTotal = 33
const blueTotal = 16
const redNum = 6
const blueNum = 1

func Main() {
	var input string
	fmt.Print("Enter gen count: ")
	fmt.Scanln(&input)
	if input == "" {
		panic("no input date")
	}
	inputInt, _ := strconv.Atoi(input)
	list := make([][]string, 0, inputInt)
	for i := 0; i < inputInt; i++ {
		list = append(list, getBalls())
	}
	output(list)
}

func output(list [][]string) {
	fmt.Printf("====\n")
	for _, v := range list {
		fmt.Printf("红：%s 蓝：%s \n", strings.Join(v[0:redNum], ","), v[redNum])
	}
	fmt.Printf("\n")
	fmt.Printf("\n")
	fmt.Printf("老板，买%d注双色球", len(list))
	fmt.Printf("\n====\n")
}

func getBalls() []string {
	redList := rand.Perm(redTotal)[0:redNum]
	blue := rand.IntN(blueTotal)
	sort.Slice(redList, func(i, j int) bool {
		return redList[i] < redList[j]
	})
	numList := append(redList, blue)
	stringList := make([]string, 0, redNum+blueNum)
	for _, v := range numList {
		stringList = append(stringList, strconv.Itoa(v+1))
	}
	return stringList
}
