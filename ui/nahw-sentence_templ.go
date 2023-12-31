// Code generated by templ - DO NOT EDIT.

// templ: version: 0.2.476
package ui

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import "context"
import "io"
import "bytes"

import "github.com/amrojjeh/kalam"

type NahwSentenceViewModel struct {
	Words      []templ.Component
	Navigation templ.Component
	Cards      []NahwCardViewModel
	Footer     templ.Component
}

type NahwSentenceState int

const (
	NahwSentenceDefault = NahwSentenceState(iota)
	NahwSentenceCorrect
	NahwSentenceIncorrect
)

func NewNahwSentenceViewModel(excerptId int, i kalam.ExcerptIterator, selected string, footer templ.Component) NahwSentenceViewModel {
	m := NahwSentenceViewModel{
		Words:      []templ.Component{},
		Navigation: navigation("0"),
		Cards:      []NahwCardViewModel{},
		Footer:     footer,
	}

	for wi, w := range i.Sentence().Words {
		m.Words = append(m.Words, Word(NewWordViewModel(w, i.WordI == wi)))
	}

	term := i.Word().Termination()
	termStr := term.Unpointed(true)

	if kalam.IsTanween(term.Vowel) {
		m.Cards = []NahwCardViewModel{
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Dammatan), "1"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Fathatan), "2"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Kasratan), "3"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Sukoon), "4"),
		}
	} else {
		m.Cards = []NahwCardViewModel{
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Damma), "1"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Fatha), "2"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Kasra), "3"),
			NewNahwCardViewModel(excerptId, i.Index, termStr+string(kalam.Sukoon), "4"),
		}
	}

	for x := 0; x < len(m.Cards); x++ {
		cm := &m.Cards[x]
		if cm.Value == selected {
			cm.State = NahwCardSelected
		}
	}

	return m
}

func (m NahwSentenceViewModel) DeactivateCards() NahwSentenceViewModel {
	for x := 0; x < len(m.Cards); x++ {
		c := &m.Cards[x]
		if c.State == NahwCardDefault {
			c.State = NahwCardUnselectable
		}
	}
	return m
}

func NahwSentence(m NahwSentenceViewModel) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, templ_7745c5c3_W io.Writer) (templ_7745c5c3_Err error) {
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templ_7745c5c3_W.(*bytes.Buffer)
		if !templ_7745c5c3_IsBuffer {
			templ_7745c5c3_Buffer = templ.GetBuffer()
			defer templ.ReleaseBuffer(templ_7745c5c3_Buffer)
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<div class=\"_screen-h _flex _flex-col\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = m.Navigation.Render(ctx, templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<div class=\"sentence-question\"><p class=\"text\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		for _, w := range m.Words {
			templ_7745c5c3_Err = w.Render(ctx, templ_7745c5c3_Buffer)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</p><div class=\"cards\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		for _, c := range m.Cards {
			templ_7745c5c3_Err = NahwCard(c).Render(ctx, templ_7745c5c3_Buffer)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</div></div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = m.Footer.Render(ctx, templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if !templ_7745c5c3_IsBuffer {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteTo(templ_7745c5c3_W)
		}
		return templ_7745c5c3_Err
	})
}